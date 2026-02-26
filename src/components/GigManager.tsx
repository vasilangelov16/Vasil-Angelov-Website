import { useState, useCallback, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Pencil, Trash2, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGigContext, type Gig } from "@/context/GigContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { APPLE_SPRING, APPLE_TAP } from "@/band/constants";

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const GigForm = memo(
  ({
    gig,
    onSubmit,
    onCancel,
  }: {
    gig?: Gig | null;
    onSubmit: (data: { title: string; date: string; venue?: string; notes?: string }) => void;
    onCancel: () => void;
  }) => {
    const [title, setTitle] = useState(gig?.title ?? "");
    const [date, setDate] = useState(gig?.date ?? new Date().toISOString().slice(0, 10));
    const [venue, setVenue] = useState(gig?.venue ?? "");
    const [notes, setNotes] = useState(gig?.notes ?? "");

    useEffect(() => {
      if (gig) {
        setTitle(gig.title);
        setDate(gig.date);
        setVenue(gig.venue ?? "");
        setNotes(gig.notes ?? "");
      } else {
        setTitle("");
        setDate(new Date().toISOString().slice(0, 10));
        setVenue("");
        setNotes("");
      }
    }, [gig?.id]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onSubmit({ title: title.trim(), date, venue: venue.trim() || undefined, notes: notes.trim() || undefined });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Gig name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Festival"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-w-[120px] px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-sm resize-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {gig ? "Save" : "Create"}
          </motion.button>
        </div>
      </form>
    );
  }
);
GigForm.displayName = "GigForm";

interface GigManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GigManager = memo(function GigManager({ open, onOpenChange }: GigManagerProps) {
  const { gigs, activeGigId, setActiveGigId, createGig, updateGig, deleteGig } = useGigContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setEditingGig(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((gig: Gig) => {
    setEditingGig(gig);
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: { title: string; date: string; venue?: string; notes?: string }) => {
      if (editingGig) {
        updateGig(editingGig.id, data);
      } else {
        const gig = createGig(data);
        setActiveGigId(gig.id);
      }
      setDialogOpen(false);
      setEditingGig(null);
    },
    [editingGig, createGig, updateGig, setActiveGigId]
  );

  const handleDelete = useCallback(
    (gig: Gig) => {
      if (window.confirm(`Delete "${gig.title}"?`)) {
        deleteGig(gig.id);
        setDialogOpen(false);
        setEditingGig(null);
      }
    },
    [deleteGig]
  );

  const handleStartGig = useCallback(
    (gig: Gig) => {
      setActiveGigId(activeGigId === gig.id ? null : gig.id);
    },
    [activeGigId, setActiveGigId]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-sm sm:max-w-md p-0 flex flex-col border-l border-gray-200/80 bg-[#fafafa] shadow-xl [&>button]:text-gray-500 [&>button]:hover:text-gray-800 [&>button]:hover:bg-gray-100/80 [&>button]:rounded-full [&>button]:p-2.5"
      >
        <SheetHeader className="px-4 py-3 border-b border-gray-100 bg-white shrink-0">
          <SheetTitle className="text-base font-semibold text-gray-900">Gigs</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
            <p className="text-xs text-gray-500">Select a gig and tap Start to track songs</p>
            <motion.button
              type="button"
              onClick={handleCreate}
              whileTap={APPLE_TAP}
              transition={APPLE_SPRING}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </motion.button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1.5 hide-scrollbar">
            {gigs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-sm font-medium text-gray-600">No gigs yet</p>
                <p className="text-xs text-gray-500 mt-1">Create a gig to track setlist history</p>
                <motion.button
                  type="button"
                  onClick={handleCreate}
                  whileTap={APPLE_TAP}
                  transition={APPLE_SPRING}
                  className="mt-4 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Create gig
                </motion.button>
              </div>
            ) : (
              gigs.map((gig) => {
                const isActive = gig.id === activeGigId;
                const isExpanded = expandedId === gig.id;
                const totalScreens = gig.history.reduce((sum, h) => sum + h.screensCount, 0);

                return (
                  <motion.div
                    key={gig.id}
                    layout
                    transition={APPLE_SPRING}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      isActive
                        ? "border-emerald-500/60 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-500/20"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <motion.button
                        type="button"
                        onClick={() => handleStartGig(gig)}
                        whileTap={APPLE_TAP}
                        transition={APPLE_SPRING}
                        className={cn(
                          "flex items-center justify-center gap-1.5 shrink-0 min-w-[72px] py-1.5 rounded-lg text-xs font-semibold transition-all",
                          isActive
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Recording
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" fill="currentColor" />
                            Start
                          </>
                        )}
                      </motion.button>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedId(isExpanded ? null : gig.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedId(isExpanded ? null : gig.id);
                          }
                        }}
                        className="flex-1 min-w-0 cursor-pointer touch-manipulation"
                      >
                        <p className={cn("font-semibold text-sm truncate", isActive ? "text-emerald-900" : "text-gray-900")}>
                          {gig.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatDate(gig.date)}
                          {gig.venue && ` · ${gig.venue}`}
                          {totalScreens > 0 && ` · ${totalScreens} screens`}
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : gig.id);
                        }}
                        whileTap={APPLE_TAP}
                        transition={APPLE_SPRING}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden border-t border-gray-200/60"
                        >
                          <div className="px-3 py-2.5 space-y-2">
                            <div className="flex gap-2">
                              <motion.button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(gig);
                                }}
                                whileTap={APPLE_TAP}
                                transition={APPLE_SPRING}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(gig);
                                }}
                                whileTap={APPLE_TAP}
                                transition={APPLE_SPRING}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </motion.button>
                            </div>
                            {gig.history.length > 0 && (
                              <div className="pt-2 border-t border-gray-200/60">
                                <p className="text-xs font-medium text-gray-500 mb-2">Setlist history</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {gig.history.map((h) => (
                                    <div key={h.songId} className="flex items-center justify-between text-xs py-1">
                                      <span className="text-gray-700 truncate flex-1">
                                        {h.songTitle}
                                        {h.songArtist && (
                                          <span className="text-gray-400 ml-1">· {h.songArtist}</span>
                                        )}
                                      </span>
                                      <span className="text-gray-500 shrink-0 ml-2">
                                        {h.screensCount} screen{h.screensCount !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            overlayClassName="backdrop-blur-md bg-black/50"
            className="max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl p-4"
          >
            <DialogHeader>
              <DialogTitle className="text-base">{editingGig ? "Edit gig" : "New gig"}</DialogTitle>
              <DialogDescription className="text-sm">
                {editingGig ? "Update the gig details." : "Create a gig to track which songs were played."}
              </DialogDescription>
            </DialogHeader>
            <GigForm
              gig={editingGig}
              onSubmit={handleSubmit}
              onCancel={() => {
                setDialogOpen(false);
                setEditingGig(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
});
