interface ModalBackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
}

export function ModalBackdrop({ isOpen, onClose, children, zIndex = 40 }: ModalBackdropProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        style={{ zIndex }}
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: zIndex + 10 }}
      >
        {children}
      </div>
    </>
  );
} 