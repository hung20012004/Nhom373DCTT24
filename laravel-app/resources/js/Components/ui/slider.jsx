import React from "react";

const Slider = React.forwardRef(({
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  className,
  ...props
}, ref) => {
  const handleChange = (event) => {
    const newValue = parseFloat(event.target.value);
    onValueChange?.(newValue);
  };

  return (
    <div className="relative flex items-center w-full touch-none select-none" {...props}>
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value ?? defaultValue}
        onChange={handleChange}
        className={`
          w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
          range-slider
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-primary
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border-2
          [&::-moz-range-thumb]:border-primary
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:transition-all
          [&::-moz-range-thumb]:shadow-sm
          hover:[&::-webkit-slider-thumb]:bg-gray-50
          hover:[&::-moz-range-thumb]:bg-gray-50
          focus:[&::-webkit-slider-thumb]:ring-2
          focus:[&::-webkit-slider-thumb]:ring-offset-2
          focus:[&::-webkit-slider-thumb]:ring-primary
          focus:[&::-moz-range-thumb]:ring-2
          focus:[&::-moz-range-thumb]:ring-offset-2
          focus:[&::-moz-range-thumb]:ring-primary
          ${className}
        `}
      />
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };
