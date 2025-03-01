import * as React from "react"

const PopoverContext = React.createContext({})

const Popover = React.forwardRef(({ open, onOpenChange, children }, ref) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
      onOpenChange?.(open)
    }
  }, [open, onOpenChange])

  // Create context value with isOpen state and onOpenChange handler
  const value = React.useMemo(() => ({
    open: isOpen,
    onOpenChange: (newOpen) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }
  }), [isOpen, onOpenChange])

  return (
    <PopoverContext.Provider value={value} ref={ref}>
      {children}
    </PopoverContext.Provider>
  )
})

Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  const { onOpenChange, open } = React.useContext(PopoverContext)

  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: (e) => {
        children.props.onClick?.(e)
        onOpenChange?.(!open)
      }
    })
  }

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onOpenChange?.(!open)}
      {...props}
    >
      {children}
    </button>
  )
})

PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(({ children, className = "", ...props }, ref) => {
  const { open } = React.useContext(PopoverContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) {
    return null
  }

  return (
    <div className={`popover-content ${className}`} ref={ref} {...props}>
      {children}
    </div>
  )
})

PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
