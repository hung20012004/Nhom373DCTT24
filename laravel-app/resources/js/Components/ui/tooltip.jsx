import { useState } from 'react';

export const Tooltip = ({ children, content, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                {...props}
            >
                {children}
            </div>
            {isOpen && (
                <div className="absolute z-10 bg-gray-800 text-white text-sm p-2 rounded shadow-lg">
                    {content}
                </div>
            )}
        </div>
    );
};

export const TooltipTrigger = ({ children }) => children;
export const TooltipContent = () => null; // Placeholder nếu không cần
export const TooltipProvider = ({ children }) => children; // Placeholder nếu không cần
