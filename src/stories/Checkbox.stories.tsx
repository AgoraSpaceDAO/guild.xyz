import { Checkbox, type CheckboxProps } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import type { Meta, StoryObj } from "@storybook/react";

const CheckboxExample = (props: CheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" {...props} />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  );
};

const meta: Meta<typeof CheckboxExample> = {
  title: "Design system/Checkbox",
  component: CheckboxExample,
};

export default meta;

type Story = StoryObj<typeof CheckboxExample>;

export const Default: Story = {
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: {
      type: "boolean",
      control: "boolean",
    },
  },
};
