import { ArrowLeft, MapPin, Check, Plus } from "lucide-react";
import { useState } from "react";

interface LinkedGymsScreenProps {
  onBack: () => void;
}

interface Gym {
  id: string;
  name: string;
  location: string;
  distance: string;
  image: string;
  isLinked: boolean;
}

export function LinkedGymsScreen({ onBack }: LinkedGymsScreenProps) {
  const [gyms, setGyms] = useState<Gym[]>([
    {
      id: "1",
      name: "Bizqwik Downtown Studio",
      location: "123 Fitness Ave, Suite 200",
      distance: "2.5 km away",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      isLinked: true,
    },
    {
      id: "2",
      name: "Bizqwik Marina Center",
      location: "456 Marina Walk, Ground Floor",
      distance: "4.2 km away",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      isLinked: true,
    },
    {
      id: "3",
      name: "Bizqwik Wellness Center",
      location: "789 Zen Plaza, Uptown",
      distance: "5.8 km away",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      isLinked: true,
    },
    {
      id: "4",
      name: "Bizqwik Sports Complex",
      location: "321 Sports Road, North District",
      distance: "7.3 km away",
      image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      isLinked: false,
    },
  ]);

  const toggleGym = (id: string) => {
    setGyms(gyms.map(gym => 
      gym.id === id ? { ...gym, isLinked: !gym.isLinked } : gym
    ));
  };

  const linkedCount = gyms.filter(g => g.isLinked).length;

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
          <div className="flex-1">
            <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">
              Linked Gyms
            </h1>
            <p className="text-[var(--bq-text-secondary)] text-[13px]">
              {linkedCount} {linkedCount === 1 ? "gym" : "gyms"} connected
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-24 space-y-4">
        {gyms.map((gym) => (
          <div
            key={gym.id}
            className="bg-white rounded-[1.5rem] overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              {/* Gym Image */}
              <div className="w-20 h-20 rounded-[1rem] overflow-hidden bg-[var(--bq-neutral)] flex-shrink-0">
                <img
                  src={gym.image}
                  alt={gym.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Gym Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[var(--bq-text-primary)] mb-1 truncate">
                  {gym.name}
                </h3>
                <div className="flex items-start gap-1 text-[var(--bq-text-secondary)] text-[13px] mb-1">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{gym.location}</span>
                </div>
                <p className="text-[var(--bq-text-tertiary)] text-[12px]">
                  {gym.distance}
                </p>
              </div>

              {/* Link Button */}
              <button
                onClick={() => toggleGym(gym.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                  gym.isLinked
                    ? "bg-[var(--bq-primary)] shadow-[var(--glow-primary)]"
                    : "bg-[var(--bq-neutral)]"
                }`}
              >
                {gym.isLinked ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-[var(--bq-text-secondary)]" />
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Info Card */}
        <div className="bg-blue-50 rounded-[1.5rem] p-4 border-l-4 border-[var(--bq-primary)]">
          <h4 className="text-[var(--bq-text-primary)] mb-2">
            About Linked Gyms
          </h4>
          <p className="text-[var(--bq-text-secondary)] text-[13px]">
            Link gyms to easily book sessions at your favorite locations. You can access all linked gyms with your membership.
          </p>
        </div>
      </div>
    </div>
  );
}
