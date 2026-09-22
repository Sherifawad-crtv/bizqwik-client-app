import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  ChevronRight,
  Award,
  Calendar,
  Zap,
  X,
  ArrowLeft,
} from "lucide-react";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { NotificationBell } from "./NotificationBell";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  category: "session" | "refund" | "topup" | "reward" | "cashback";
  date: string;
  time: string;
  pointsEarned?: number;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "debit",
    amount: 45.0,
    description: "Power Yoga Flow",
    category: "session",
    date: "Oct 28, 2025",
    time: "09:30 AM",
    pointsEarned: 150,
  },
  {
    id: "2",
    type: "credit",
    amount: 2.25,
    description: "Cashback Reward",
    category: "cashback",
    date: "Oct 28, 2025",
    time: "09:31 AM",
  },
  {
    id: "3",
    type: "credit",
    amount: 100.0,
    description: "Wallet Top-up",
    category: "topup",
    date: "Oct 26, 2025",
    time: "03:15 PM",
  },
  {
    id: "4",
    type: "debit",
    amount: 50.0,
    description: "HIIT Cardio Blast",
    category: "session",
    date: "Oct 25, 2025",
    time: "06:00 PM",
    pointsEarned: 200,
  },
  {
    id: "5",
    type: "credit",
    amount: 2.5,
    description: "Cashback Reward",
    category: "cashback",
    date: "Oct 25, 2025",
    time: "06:01 PM",
  },
  {
    id: "6",
    type: "credit",
    amount: 25.0,
    description: "Cancellation Refund",
    category: "refund",
    date: "Oct 23, 2025",
    time: "11:20 AM",
  },
  {
    id: "7",
    type: "debit",
    amount: 40.0,
    description: "Strength Foundations",
    category: "session",
    date: "Oct 22, 2025",
    time: "07:30 AM",
    pointsEarned: 120,
  },
  {
    id: "8",
    type: "credit",
    amount: 50.0,
    description: "Wallet Top-up",
    category: "topup",
    date: "Oct 20, 2025",
    time: "02:00 PM",
  },
];

interface WalletScreenProps {
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onBack?: () => void;
}

export function WalletScreen({ onNotificationsClick, notificationCount = 0, onBack }: WalletScreenProps = {}) {
  const [balance, setBalance] = useState(145.5);
  const [autoTopUp, setAutoTopUp] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const quickAmounts = [25, 50, 100, 200];

  const handleAddFunds = (method: "apple" | "card") => {
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    
    if (amount <= 0) {
      toast.error("Please select or enter an amount");
      return;
    }

    setBalance((prev) => prev + amount);
    toast.success(`$${amount.toFixed(2)} added via ${method === "apple" ? "Apple Pay" : "Card"}`);
    setShowAddFunds(false);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  const handleAutoTopUpToggle = (checked: boolean) => {
    setAutoTopUp(checked);
    if (checked) {
      toast.success("Auto top-up enabled at $25 threshold");
    } else {
      toast.success("Auto top-up disabled");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "session":
        return <Zap className="w-4 h-4" />;
      case "refund":
        return <TrendingUp className="w-4 h-4" />;
      case "topup":
        return <Plus className="w-4 h-4" />;
      case "reward":
      case "cashback":
        return <Award className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "session":
        return "text-[var(--bq-primary)] bg-[var(--bq-primary)]/10";
      case "refund":
        return "text-green-600 bg-green-50";
      case "topup":
        return "text-blue-600 bg-blue-50";
      case "reward":
      case "cashback":
        return "text-[var(--bq-accent)] bg-[var(--bq-accent)]/10";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const totalCashback = mockTransactions
    .filter((t) => t.category === "cashback")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[var(--bq-neutral)] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center active:scale-95 transition-transform mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--bq-text-primary)]" />
          </button>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-[var(--bq-text-primary)] mb-1">
              Wallet
            </h1>
            <p className="text-sm text-[var(--bq-text-secondary)]">
              Manage your balance & payments
            </p>
          </div>
          {onNotificationsClick && (
            <NotificationBell 
              count={notificationCount} 
              onClick={onNotificationsClick}
            />
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--bq-primary)] to-purple-600 p-6 shadow-[var(--shadow-lg)]"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20px 20px, white 2px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/70 text-sm mb-2">Available Balance</p>
                <motion.h2
                  key={balance}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-4xl text-white"
                >
                  ${balance.toFixed(2)}
                </motion.h2>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAddFunds(true)}
                className="h-11 bg-white text-[var(--bq-primary)] rounded-xl transition-all duration-[var(--transition-base)] hover:bg-white/90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Funds</span>
              </button>
              <div className="h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 text-white text-sm">
                <Award className="w-4 h-4" />
                <span className="font-mono">${totalCashback.toFixed(2)} earned</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Auto Top-up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-[var(--bq-neutral-dark)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-[var(--bq-text-primary)] mb-1">Auto Top-up</h3>
              <p className="text-sm text-[var(--bq-text-secondary)]">
                Auto-add $50 when balance drops below $25
              </p>
            </div>
            <Switch checked={autoTopUp} onCheckedChange={handleAutoTopUpToggle} />
          </div>
        </motion.div>

        {/* Cashback Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-r from-[var(--bq-accent)]/10 to-amber-50 rounded-2xl p-5 border border-[var(--bq-accent)]/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bq-accent)] flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--bq-text-primary)] mb-1">Cashback Rewards</h3>
              <p className="text-sm text-[var(--bq-text-secondary)] mb-3">
                Earn 5% cashback on every session booking
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-[var(--bq-accent)] text-white border-0">
                  ${totalCashback.toFixed(2)} Total Earned
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-[var(--bq-neutral-dark)]" />

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--bq-text-primary)]">Recent Transactions</h3>
            <span className="text-xs text-[var(--bq-text-secondary)]">
              {mockTransactions.length} transactions
            </span>
          </div>

          <div className="space-y-3">
            {mockTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                className="bg-white rounded-xl p-4 border border-[var(--bq-neutral-dark)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(
                      transaction.category
                    )}`}
                  >
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-[var(--bq-text-primary)] truncate">
                          {transaction.description}
                        </h4>
                        <p className="text-xs text-[var(--bq-text-tertiary)]">
                          {transaction.date} • {transaction.time}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div
                          className={`font-mono ${
                            transaction.type === "credit"
                              ? "text-green-600"
                              : "text-[var(--bq-text-primary)]"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </div>
                        {transaction.pointsEarned && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <Award className="w-3 h-3 text-[var(--bq-accent)]" />
                            <span className="text-xs font-mono text-[var(--bq-text-secondary)]">
                              +{transaction.pointsEarned}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {showAddFunds && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAddFunds(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-[var(--bq-neutral-dark)]">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl text-[var(--bq-text-primary)]">
                    Add Funds
                  </h2>
                  <button
                    onClick={() => setShowAddFunds(false)}
                    className="w-8 h-8 rounded-lg bg-[var(--bq-secondary)] flex items-center justify-center hover:bg-[var(--bq-neutral-dark)] transition-colors duration-[var(--transition-base)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[var(--bq-text-secondary)]">
                  Choose an amount to add to your wallet
                </p>
              </div>

              <div className="px-6 py-6 space-y-6 pb-8">
                {/* Quick Amount Selection */}
                <div>
                  <label className="block text-sm text-[var(--bq-text-secondary)] mb-3">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className={`h-14 rounded-xl border-2 transition-all duration-[var(--transition-base)] active:scale-95 ${
                          selectedAmount === amount
                            ? "border-[var(--bq-primary)] bg-[var(--bq-primary)]/5 text-[var(--bq-primary)]"
                            : "border-[var(--bq-neutral-dark)] bg-white text-[var(--bq-text-primary)] hover:border-[var(--bq-primary)]/40"
                        }`}
                      >
                        <div className="font-mono">${amount}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-sm text-[var(--bq-text-secondary)] mb-3">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bq-text-secondary)]">
                      $
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="w-full h-14 pl-8 pr-4 rounded-xl border-2 border-[var(--bq-neutral-dark)] bg-white text-[var(--bq-text-primary)] font-mono focus:border-[var(--bq-primary)] focus:outline-none transition-colors duration-[var(--transition-base)]"
                    />
                  </div>
                </div>

                <Separator className="bg-[var(--bq-neutral-dark)]" />

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm text-[var(--bq-text-secondary)] mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAddFunds("apple")}
                      className="w-full h-14 bg-black text-white rounded-xl transition-all duration-[var(--transition-base)] hover:bg-gray-900 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>Pay with Apple Pay</span>
                    </button>
                    <button
                      onClick={() => handleAddFunds("card")}
                      className="w-full h-14 bg-[var(--bq-primary)] text-white rounded-xl transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Pay with Card</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-900">
                    💡 Funds are added instantly and can be used for any session booking.
                    Unused balance never expires.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
