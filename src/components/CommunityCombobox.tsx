import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  groups?: { label: string; items: string[] }[]; // optional grouping headers
}

export const CommunityCombobox: React.FC<CommunityComboboxProps> = ({ value, onChange, options, placeholder = 'Select...', groups }) => {
  const [open, setOpen] = React.useState(false);
  const sorted = React.useMemo(() => [...options].sort((a, b) => a.localeCompare(b)), [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search community..." />
          <CommandEmpty>No community found.</CommandEmpty>
          <CommandList>
            {groups && groups.length > 0 ? (
              groups.map((g) => (
                <CommandGroup key={g.label} heading={g.label}>
                  {g.items.map((item) => (
                    <CommandItem
                      key={`${g.label}-${item}`}
                      value={item}
                      onSelect={(cv) => {
                        onChange(cv);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', value === item ? 'opacity-100' : 'opacity-0')} />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {sorted.map((community) => (
                  <CommandItem
                    key={community}
                    value={community}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === community ? 'opacity-100' : 'opacity-0')} />
                    {community}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CommunityCombobox;


