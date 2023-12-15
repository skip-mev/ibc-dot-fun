import { create } from "zustand";

const defaultValues = {
  contactForm: false,
  historyDialog: false,
  settingsDialog: false,
  swapDetailsCollapsible: false,

  // TODO: port dialogs to new system
  // assetSelect: false,
  // chainSelect: false,
  // txDialog: false,
};

export type DisclosureStore = typeof defaultValues & {
  json?: { title?: string; data: unknown };
};
export type DisclosureKey = keyof typeof defaultValues;

const disclosureStore = create<DisclosureStore>(() => ({
  ...defaultValues,
}));

const scrollStore = create<{ value: number[] }>(() => ({ value: [] }));
const persistScroll = () => {
  scrollStore.setState((prev) => ({
    value: prev.value.concat(window.scrollY),
  }));
};
const restoreScroll = () => {
  let value: number | undefined;
  scrollStore.setState((prev) => {
    value = prev.value.pop();
    return prev;
  });
  window.scrollTo({
    top: value,
    behavior: "smooth",
  });
};
const scrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const disclosure = {
  open: (key: DisclosureKey, { closeAll = false } = {}) => {
    persistScroll();
    disclosureStore.setState({
      ...(closeAll ? defaultValues : {}),
      [key]: true,
    });
    if (key.toLowerCase().endsWith("dialog")) {
      scrollTop();
    }
  },
  openJson: (json: NonNullable<DisclosureStore["json"]>) => {
    disclosureStore.setState({ json });
    persistScroll();
    scrollTop();
  },
  close: (key: DisclosureKey) => {
    disclosureStore.setState({ [key]: false });
    restoreScroll();
  },
  closeJson: () => {
    disclosureStore.setState({ json: undefined });
    restoreScroll();
  },
  toggle: (key: DisclosureKey) => {
    let latest: boolean | undefined;
    disclosureStore.setState((prev) => {
      latest = !prev[key];
      if (latest) persistScroll();
      return { [key]: latest };
    });
    if (typeof latest === "boolean" && !latest) {
      restoreScroll();
    }
  },
  set: (key: DisclosureKey, value: boolean) => {
    disclosureStore.setState({ [key]: value });
  },
  closeAll: () => {
    disclosureStore.setState(defaultValues);
    restoreScroll();
  },
};

export const useDisclosureKey = (key: DisclosureKey) => {
  const state = disclosureStore((state) => state[key]);
  const actions = {
    open: ({ closeAll = false } = {}) => disclosure.open(key, { closeAll }),
    close: () => disclosure.close(key),
    toggle: () => disclosure.toggle(key),
    set: (value: boolean) => disclosure.set(key, value),
  };
  return [state, actions] as const;
};

export const useJsonDisclosure = () => {
  const state = disclosureStore((state) => state.json);
  const actions = {
    open: (json: NonNullable<DisclosureStore["json"]>) => {
      disclosureStore.setState({ json });
    },
    close: () => {
      disclosureStore.setState({ json: undefined });
    },
  };
  return [state, actions] as const;
};
