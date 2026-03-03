"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import type { InputProps } from "~/components/ui/input";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type PasswordInputProps = Omit<InputProps, "type">;

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup className={typeof className === 'string' ? className : undefined}>
      <InputGroupInput type={showPassword ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="border-0 focus-visible:ring-0"
                onClick={() => setShowPassword(!showPassword)}
                size="icon-xs"
                type="button"
                variant="ghost"
              />
            }
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </TooltipTrigger>
          <TooltipPopup>
            {showPassword ? "Hide password" : "Show password"}
          </TooltipPopup>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput, type PasswordInputProps };
