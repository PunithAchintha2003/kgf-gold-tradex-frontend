import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export type CurrencyUnit = 'troy-ounce' | 'pawn';

interface CurrencyDropdownProps {
  value: CurrencyUnit;
  onChange: (unit: CurrencyUnit) => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = React.memo(({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">Unit:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] sm:w-[180px]">
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="troy-ounce">Troy Ounce (USD)</SelectItem>
          <SelectItem value="pawn">1 Pawn (LKR)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

CurrencyDropdown.displayName = 'CurrencyDropdown';

export default CurrencyDropdown;
