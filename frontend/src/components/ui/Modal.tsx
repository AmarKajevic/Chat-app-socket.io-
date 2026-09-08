// components/ui/Modal.tsx
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    connectcode?: string; // Korisnikov connect code
}

const Modal = ({ isOpen, onClose, title, children, footer, size = "lg", connectcode }: ModalProps) => {
    if (!isOpen) return null;

    const sizeClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className={`bg-white rounded-2xl shadow-lg w-full ${sizeClass[size]} p-6`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {title && <h2 className="text-xl font-semibold text-black">{title}</h2>}
                        {connectcode && (
                            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-mono">
                               Your Connect Code: {connectcode}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-lg font-bold cursor-pointer"
                    >
                        <X />
                    </button>
                </div>
                <div className="mb-4">
                    {children}
                </div>
                {footer && <div className="mt-4">{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;