import { useUIStore } from "@/stores/uiStore";

export function useToast() {
  const { addToast, removeToast, toasts } = useUIStore();

  const toast = (props: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => {
    const id = addToast(props);
    return {
      id,
      dismiss: () => removeToast(id),
    };
  };

  return {
    toast,
    dismiss: removeToast,
    toasts,
  };
}