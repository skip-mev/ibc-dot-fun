import React from 'react';

interface IbcWidgetProps {
  children: React.ReactNode;
}
  
// Continue to migrate features from Widget component over to React widget
export const IbcWidget: React.FC<IbcWidgetProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
}; 
