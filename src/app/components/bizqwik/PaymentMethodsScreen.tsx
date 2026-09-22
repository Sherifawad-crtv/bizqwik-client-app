import { ArrowLeft, CreditCard, Wallet, Plus, Check, Trash2 } from "lucide-react";
import { useState } from "react";

interface PaymentMethodsScreenProps {
  onBack: () => void;
}

interface PaymentMethod {
  id: string;
  type: "card" | "wallet";
  name: string;
  details: string;
  icon?: string;
  isDefault: boolean;
}

export function PaymentMethodsScreen({ onBack }: PaymentMethodsScreenProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "wallet",
      name: "Bizqwik Wallet",
      details: "AED 2,450.00",
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      name: "Visa",
      details: "•••• 4242",
      icon: "💳",
      isDefault: false,
    },
    {
      id: "3",
      type: "card",
      name: "Mastercard",
      details: "•••• 8888",
      icon: "💳",
      isDefault: false,
    },
  ]);

  const setDefaultMethod = (id: string) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const deleteMethod = (id: string) => {
    if (methods.find(m => m.id === id)?.isDefault && methods.length > 1) {
      // Set first remaining method as default
      const remaining = methods.filter(m => m.id !== id);
      setMethods(remaining.map((m, i) => ({ ...m, isDefault: i === 0 })));
    } else {
      setMethods(methods.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)]">
      {/* Header */}
      <div className="bg-white pt-16 pb-6 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--bq-text-primary)]" />
          </button>
          <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">
            Payment Methods
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-24 space-y-4">
        {/* Payment Methods List */}
        {methods.map((method) => (
          <div
            key={method.id}
            className="bg-white rounded-[1.5rem] p-4"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                method.type === "wallet" 
                  ? "bg-gradient-to-br from-[var(--bq-primary)] to-[#7C6AFF]"
                  : "bg-[var(--bq-neutral)]"
              }`}>
                {method.type === "wallet" ? (
                  <Wallet className="w-6 h-6 text-white" />
                ) : (
                  <CreditCard className="w-6 h-6 text-[var(--bq-primary)]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[var(--bq-text-primary)]">{method.name}</h3>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-[var(--bq-primary)]/10 text-[var(--bq-primary)] text-[11px] rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[var(--bq-text-secondary)] text-[13px] font-mono">
                  {method.details}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => setDefaultMethod(method.id)}
                    className="w-9 h-9 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Check className="w-4 h-4 text-[var(--bq-text-secondary)]" />
                  </button>
                )}
                {method.type === "card" && (
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card Button */}
        <button className="w-full h-14 border-2 border-dashed border-[var(--bq-secondary)] rounded-[1.25rem] flex items-center justify-center gap-2 text-[var(--bq-primary)] active:bg-[var(--bq-neutral)] transition-colors">
          <Plus className="w-5 h-5" />
          Add New Card
        </button>

        {/* Info Cards */}
        <div className="space-y-3 pt-2">
          <div className="bg-blue-50 rounded-[1.25rem] p-4 border-l-4 border-[var(--bq-primary)]">
            <h4 className="text-[var(--bq-text-primary)] mb-1 text-[14px]">
              Secure Payments
            </h4>
            <p className="text-[var(--bq-text-secondary)] text-[12px]">
              All payment methods are encrypted and stored securely. We never share your payment information.
            </p>
          </div>

          <div className="bg-amber-50 rounded-[1.25rem] p-4 border-l-4 border-[var(--bq-accent)]">
            <h4 className="text-[var(--bq-text-primary)] mb-1 text-[14px]">
              Wallet Benefits
            </h4>
            <p className="text-[var(--bq-text-secondary)] text-[12px]">
              Using your Bizqwik Wallet gives you instant booking and exclusive rewards points on every transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
