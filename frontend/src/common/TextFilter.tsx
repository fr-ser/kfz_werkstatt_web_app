import * as React from "react";
import { TextField, InputAdornment } from "@material-ui/core";
import { StandardTextFieldProps } from "@material-ui/core/TextField";
import { Search } from "@material-ui/icons";

import { debounce } from "common/utils";

interface TextFilterProps extends Omit<StandardTextFieldProps, "onChange"> {
  onChange: (value: string) => void;
}

export default function TextFilter(props: TextFilterProps) {
  let { InputProps: PassedInputProps, onChange, ...otherProps } = props;

  const defaultInputProps = {
    endAdornment: (
      <InputAdornment position="end">
        <Search />
      </InputAdornment>
    ),
  };
  const InputProps = { ...defaultInputProps, ...PassedInputProps };
  const debouncedOnChange = debounce(onChange, 250);

  return (
    <TextField
      fullWidth
      label="Filter"
      onChange={evt => debouncedOnChange(evt.target.value)}
      inputProps={{ role: "text-filter-input" }}
      InputProps={InputProps}
      {...otherProps}
    />
  );
}
