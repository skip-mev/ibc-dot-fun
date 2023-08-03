import bip39 from "bip39";
import { Wallet } from "ethers";
import secp256k1 from "secp256k1";
import keccak256 from "keccak256";
// import { DEFAULT_DERIVATION_PATH } from '../../utils/constants'
import { PublicKey } from "./PublicKey";
import { Address } from "./Address";
import * as BytesUtils from "@ethersproject/bytes";
import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { sha256 } from "ethers/lib/utils";
import { Secp256k1 } from "@cosmjs/crypto";

/**
 * Class for wrapping SigningKey that is used for signature creation and public key derivation.
 *
 * @category Crypto Utility Classes
 */
export class PrivateKey {
  public wallet: Wallet;

  private constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  /**
   * Create a PrivateKey instance from a given private key and a HD derivation path.
   * If path is not given, default to Band's HD prefix 494 and all other indexes being zeroes.
   * @param {string} privateKey  the private key
   * @returns {PrivateKey} Initialized PrivateKey object
   *
   * @deprecated - use fromHex instead
   */
  static fromPrivateKey(privateKey: string): PrivateKey {
    return new PrivateKey(new Wallet(privateKey));
  }

  /**
   * Create a PrivateKey instance from a given private key and a HD derivation path.
   * If path is not given, default to Band's HD prefix 494 and all other indexes being zeroes.
   * @param {string} privateKey  the private key
   * @returns {PrivateKey} Initialized PrivateKey object
   */
  static fromHex(privateKey: string): PrivateKey {
    return new PrivateKey(new Wallet(privateKey));
  }

  /**
   * Return the private key in hex
   * @returns {string}
   **/
  toPrivateKeyHex(): string {
    return this.wallet.privateKey.startsWith("0x")
      ? this.wallet.privateKey
      : `0x${this.wallet.privateKey}`;
  }

  /**
   * Return the PublicKey associated with this private key.
   * @returns {PublicKey} a Public key that can be used to verify the signatures made with this PrivateKey
   **/
  toPublicKey(): PublicKey {
    return PublicKey.fromHex(this.wallet.privateKey);
  }

  /**
   * Return a hex representation of signing key.
   * @returns {string}
   */
  toHex(): string {
    return this.wallet.address.startsWith("0x")
      ? this.wallet.address
      : `0x${this.wallet.address}`;
  }

  /**
   * Return the Address associated with this private key.
   * @returns {Address}
   **/
  toAddress(): Address {
    return Address.fromHex(this.toHex());
  }

  /**
   * Return the Bech32 address associated with this private key.
   * @returns {string}
   **/
  toBech32(): string {
    return Address.fromHex(this.toHex()).toBech32();
  }

  /**
   * Sign the given message using the wallet's _signingKey function.
   * @param {string} messageBytes: the message that will be hashed and signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async sign(messageBytes: Uint8Array): Promise<Uint8Array> {
    const { wallet } = this;

    // const msgHash = keccak256(messageBytes);

    const msgHash = sha256(messageBytes);

    // const msgHash = messageBytes.toString("hex");

    const signature = await wallet._signingKey().signDigest(msgHash);
    const splitSignature = BytesUtils.splitSignature(signature);

    return BytesUtils.arrayify(
      BytesUtils.concat([splitSignature.r, splitSignature.s])
    );
  }

  /**
   * Sign the given message using the edcsa sign_deterministic function.
   * @param {Buffer} messageBytes: the message that will be hashed and signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signEcda(messageBytes: Buffer): Promise<Uint8Array> {
    const { wallet } = this;

    const msgHash = keccak256(messageBytes);
    const privateKeyHex = wallet.privateKey.startsWith("0x")
      ? wallet.privateKey.slice(2)
      : wallet.privateKey;
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));
    const { signature } = secp256k1.ecdsaSign(
      Uint8Array.from(msgHash),
      privateKey
    );

    return signature;
  }

  /**
   * Sign the given message using the wallet's _signingKey function.
   * @param {string} messageHashedBytes: the message that will be signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  // async signHashed(messageHashedBytes: Buffer): Promise<Uint8Array> {
  //   const { wallet } = this

  //   const signature = await wallet._signingKey().signDigest(messageHashedBytes)
  //   const splitSignature = BytesUtils.splitSignature(signature)

  //   return BytesUtils.arrayify(
  //     BytesUtils.concat([splitSignature.r, splitSignature.s]),
  //   )
  // }

  /**
   * Sign the given message using the edcsa sign_deterministic function.
   * @param {Buffer} messageHashedBytes: the message that will be signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signHashedEcda(messageHashedBytes: Buffer): Promise<Uint8Array> {
    const { wallet } = this;

    const privateKeyHex = wallet.privateKey.startsWith("0x")
      ? wallet.privateKey.slice(2)
      : wallet.privateKey;
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));
    const { signature } = secp256k1.ecdsaSign(messageHashedBytes, privateKey);

    return signature;
  }

  /**
   * Sign the given typed data using the edcsa sign_deterministic function.
   * @param {Buffer} eip712Data: the typed data that will be hashed and signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signTypedData(eip712Data: any): Promise<Uint8Array> {
    const { wallet } = this;

    const privateKeyHex = wallet.privateKey.startsWith("0x")
      ? wallet.privateKey.slice(2)
      : wallet.privateKey;
    const signature = signTypedData({
      privateKey: Buffer.from(privateKeyHex, "hex"),
      data: eip712Data,
      version: SignTypedDataVersion.V4,
    });

    return Buffer.from(signature.replace("0x", ""), "hex");
  }

  /**
   * Sign the given typed data using the edcsa sign_deterministic function.
   * @param {Buffer} eip712Data: the typed data that will be signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signHashedTypedData(eip712Data: Buffer): Promise<Uint8Array> {
    const { wallet } = this;

    const privateKeyHex = wallet.privateKey.startsWith("0x")
      ? wallet.privateKey.slice(2)
      : wallet.privateKey;
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));
    const { signature } = secp256k1.ecdsaSign(eip712Data, privateKey);

    return signature;
  }
}
