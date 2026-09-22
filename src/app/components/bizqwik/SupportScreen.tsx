import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SupportScreenProps {
  onBack: () => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function SupportScreen({ onBack }: SupportScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I book a session?",
      answer: "Browse available sessions on the home screen, select your preferred class, choose a time slot, and confirm your booking. You can pay using your wallet or credit card.",
      category: "Booking",
    },
    {
      id: "2",
      question: "Can I cancel or reschedule my booking?",
      answer: "Yes! You can cancel or reschedule up to 2 hours before the session starts. Go to 'My Bookings', select your session, and choose 'Cancel' or 'Reschedule'. Cancellations made at least 2 hours in advance will receive a full refund to your wallet.",
      category: "Booking",
    },
    {
      id: "3",
      question: "How do I earn reward points?",
      answer: "You earn points by attending sessions, maintaining streaks, referring friends, and completing challenges. Points can be redeemed for free sessions, merchandise, or wallet credits.",
      category: "Rewards",
    },
    {
      id: "4",
      question: "What happens if I miss a session?",
      answer: "If you miss a booked session without canceling, the session credit will be deducted from your membership. To avoid this, always cancel at least 2 hours before the session starts.",
      category: "Booking",
    },
    {
      id: "5",
      question: "How do I add money to my wallet?",
      answer: "Go to the Wallet screen, tap 'Add Money', enter the amount, and choose your payment method. Funds are added instantly and can be used for bookings and purchases.",
      category: "Wallet",
    },
    {
      id: "6",
      question: "What membership plans are available?",
      answer: "We offer Basic (4 sessions/month), Standard (8 sessions/month), and Premium (Unlimited sessions). All plans include access to all gyms and classes. Visit the Membership screen to upgrade or change your plan.",
      category: "Membership",
    },
    {
      id: "7",
      question: "Can I freeze my membership?",
      answer: "Yes, you can freeze your membership for up to 30 days per year. Contact support or go to Membership > Manage Plan > Freeze Membership.",
      category: "Membership",
    },
    {
      id: "8",
      question: "How do I refer a friend?",
      answer: "Go to Rewards > Refer Friends, share your unique referral code. When your friend signs up and completes their first session, you both earn 500 bonus points!",
      category: "Rewards",
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
            Support & FAQs
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-24 space-y-6">
        {/* Contact Options */}
        <div className="space-y-3">
          <h2 className="text-[var(--bq-text-secondary)] text-[13px] px-1 mb-3">
            CONTACT US
          </h2>

          <button className="w-full bg-white rounded-[1.25rem] p-4 flex items-center gap-4 active:bg-[var(--bq-neutral)] transition-colors">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--bq-primary)] to-[#7C6AFF] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[var(--bq-text-primary)] mb-0.5">Live Chat</div>
              <div className="text-[var(--bq-text-secondary)] text-[13px]">
                Chat with our support team
              </div>
            </div>
          </button>

          <button className="w-full bg-white rounded-[1.25rem] p-4 flex items-center gap-4 active:bg-[var(--bq-neutral)] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center">
              <Mail className="w-6 h-6 text-[var(--bq-primary)]" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[var(--bq-text-primary)] mb-0.5">Email Support</div>
              <div className="text-[var(--bq-text-secondary)] text-[13px]">
                support@bizqwik.com
              </div>
            </div>
          </button>

          <button className="w-full bg-white rounded-[1.25rem] p-4 flex items-center gap-4 active:bg-[var(--bq-neutral)] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center">
              <Phone className="w-6 h-6 text-[var(--bq-primary)]" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[var(--bq-text-primary)] mb-0.5">Phone Support</div>
              <div className="text-[var(--bq-text-secondary)] text-[13px] font-mono">
                +971 4 123 4567
              </div>
            </div>
          </button>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h2 className="text-[var(--bq-text-secondary)] text-[13px] px-1 mb-3">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-[1.25rem] overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full p-4 flex items-start gap-3 text-left active:bg-[var(--bq-neutral)] transition-colors"
              >
                <div className="flex-1">
                  <div className="text-[var(--bq-text-primary)] mb-1">
                    {faq.question}
                  </div>
                  <div className="text-[var(--bq-primary)] text-[11px] uppercase tracking-wide">
                    {faq.category}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {expandedId === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-[var(--bq-primary)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--bq-text-secondary)]" />
                  )}
                </div>
              </button>
              
              {expandedId === faq.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="p-3 bg-[var(--bq-neutral)] rounded-[1rem]">
                    <p className="text-[var(--bq-text-secondary)] text-[13px] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Card */}
        <div className="bg-gradient-to-br from-[var(--bq-primary)] to-[#7C6AFF] rounded-[1.5rem] p-6 text-white">
          <h3 className="mb-2">Still Need Help?</h3>
          <p className="text-white/80 text-[13px] mb-4">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <button className="w-full h-12 bg-white text-[var(--bq-primary)] rounded-[1rem] active:scale-95 transition-transform">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
