import * as React from "react"
import { Search } from "lucide-react"

// Helper function to combine class names
const cn = (...classes) => classes.filter(Boolean).join(" ")

const CommandContext = React.createContext({})

const Command = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [search, setSearch] = React.useState(value || "")
  const [selectedIndex, setSelectedIndex] = React.useState(-1)

  React.useEffect(() => {
    if (value !== undefined) {
      setSearch(value)
      onValueChange?.(value)
    }
  }, [value, onValueChange])

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch,
        selectedIndex,
        setSelectedIndex
      }}
    >
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-900",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
})
Command.displayName = "Command"

const CommandInput = React.forwardRef(({ className, value, onValueChange, ...props }, ref) => {
  const { search, setSearch } = React.useContext(CommandContext)

  const handleChange = (e) => {
    const newValue = e.target.value
    setSearch(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        type="text"
        value={value ?? search}
        onChange={handleChange}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
})
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  >
    {children}
  </div>
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("py-6 text-center text-sm", className)} {...props}>
    {children}
  </div>
))
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef(({ className, children, heading, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-gray-900",
      className
    )}
    {...props}
  >
    {heading && (
      <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
        {heading}
      </div>
    )}
    {children}
  </div>
))
CommandGroup.displayName = "CommandGroup"

const CommandItem = React.forwardRef(({ className, children, onSelect, ...props }, ref) => {
  const { selectedIndex, setSelectedIndex } = React.useContext(CommandContext)
  const itemRef = React.useRef(null)

  const handleClick = () => {
    onSelect?.()
  }

  return (
    <div
      ref={mergeRefs(ref, itemRef)}
      role="option"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 aria-selected:bg-gray-100",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
})
CommandItem.displayName = "CommandItem"

const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-gray-200", className)}
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"

const CommandShortcut = ({ className, children, ...props }) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest text-gray-500",
      className
    )}
    {...props}
  >
    {children}
  </span>
)
CommandShortcut.displayName = "CommandShortcut"

// Helper function to merge refs
const mergeRefs = (...refs) => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ref.current = value
      }
    })
  }
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
