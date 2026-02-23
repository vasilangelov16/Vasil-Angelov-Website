import { memo } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Music,
  List,
  FileText,
  Search,
  Sparkles,
  Timer,
  Users,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_SPRING, APPLE_TAP } from "@/band/constants";

const TutorialStep = memo(
  ({
    icon: Icon,
    title,
    description,
    className,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    className?: string;
  }) => (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100",
        className
      )}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-[15px]">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
);
TutorialStep.displayName = "TutorialStep";

interface BandAppTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authRole: "singer" | "member";
}

export const BandAppTutorial = memo(
  ({ open, onOpenChange, authRole }: BandAppTutorialProps) => {
    const isSinger = authRole === "singer";

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          overlayClassName="backdrop-blur-md bg-black/40"
          className="band-app-font fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] sm:w-full max-w-lg max-h-[85dvh] -translate-x-1/2 -translate-y-1/2 flex flex-col min-h-0 rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white shadow-2xl shadow-black/10 p-0 gap-0 overflow-hidden [&>button]:hidden"
        >
          <motion.button
            type="button"
            onClick={() => onOpenChange(false)}
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </motion.button>
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <DialogHeader className="tutorial-modal-header flex-shrink-0 px-6 pt-6 pb-4 pr-14 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm">
                  <Music className="w-6 h-6 text-gray-600" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="tutorial-title text-xl text-gray-900 tracking-tight leading-tight">
                    How to Use
                  </DialogTitle>
                  <p className="text-[13px] text-gray-500 mt-1 font-medium tracking-wide">
                    {isSinger ? "Singer guide" : "Member guide"}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 pb-6 space-y-3 lyrics-scroll">
              {isSinger ? (
                <>
                  <TutorialStep
                    icon={List}
                    title="Browse the setlist"
                    description="Scroll through songs and tap one to select it as the current song. All connected members will see it update instantly."
                  />
                  <TutorialStep
                    icon={Search}
                    title="Search & filter"
                    description="Use the search bar to find songs by title, artist, or key. Filter by category (Stranski, EX-YU, Makedonski, etc.) to narrow the list."
                  />
                  <TutorialStep
                    icon={FileText}
                    title="View lyrics"
                    description="Switch to Lyrics view to see the full lyrics for the current song. Double-tap any song in the setlist to preview its lyrics in a modal."
                  />
                  <TutorialStep
                    icon={Sparkles}
                    title="AI suggestions"
                    description="Tap the sparkle icon on the current song to get AI-suggested next songs based on key, tempo, and feel. Great for keeping the flow."
                  />
                  <TutorialStep
                    icon={Music}
                    title="Now Playing"
                    description="Tap the compact Now Playing bar at the top to scroll the setlist to the current song. Handy when you've scrolled away."
                  />
                </>
              ) : (
                <>
                  <TutorialStep
                    icon={Music}
                    title="Now Playing"
                    description="The large display shows the current song, artist, key, and BPM. The singer controls this from their device—it syncs to all members in real time."
                  />
                  <TutorialStep
                    icon={Timer}
                    title="Metronome"
                    description="Tap the timer icon to show the metronome. It uses the song's BPM when available. Toggle it on or off as needed during rehearsals or performances."
                  />
                  <TutorialStep
                    icon={Users}
                    title="Stay in sync"
                    description="The dot on the music icon shows Live (green), Offline (gray), or Connecting (amber). If the server is unreachable, the app works offline with the last synced setlist."
                  />
                </>
              )}
            </div>

            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
              <motion.button
                type="button"
                onClick={() => onOpenChange(false)}
                whileTap={APPLE_TAP}
                transition={APPLE_SPRING}
                className="w-full py-3.5 px-4 rounded-xl bg-gray-900 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm"
              >
                Got it
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
BandAppTutorial.displayName = "BandAppTutorial";
