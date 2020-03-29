import React from "react";
import { fireEvent, render } from "@testing-library/react";

import TextFilter from "common/TextFilter";

describe("TextFilter", () => {
  it("debounces the onChange", () => {
    jest.useFakeTimers();
    var mockFn = jest.fn();

    const { getByRole } = render(<TextFilter onChange={mockFn} />);

    const input = getByRole("text-filter-input");
    fireEvent.change(input, { target: { value: "23" } });
    expect(mockFn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalled();
  });

  it("passes the inputValue to onChange", () => {
    jest.useFakeTimers();
    var mockFn = jest.fn();

    const { getByRole } = render(<TextFilter onChange={mockFn} />);

    const input = getByRole("text-filter-input");
    fireEvent.change(input, { target: { value: "23" } });
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledWith("23");
  });
});
