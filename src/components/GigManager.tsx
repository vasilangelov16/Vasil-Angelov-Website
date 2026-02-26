import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGigContext, type Gig } from "@/context/GigContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onSubmit({ title: title.trim(), date, venue: venue.trim() || undefined, notes: notes.trim() || undefined });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gig name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Festival"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue (optional)</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. City Hall"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Setlist notes..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all resize-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {gig ? "Save" : "Create"}
          </motion.button>
        </div>
      </form>
    );
  }
);
GigForm.displayName = "GigForm";

export const GigManager = memo(function GigManager() {
  const { gigs, activeGigId, setActiveGigId, createGig, updateGig, deleteGig } = useGigContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeGig = gigs.find((g) => g.id === activeGigId);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Upcoming gigs</h3>
        <motion.button
          type="button"
          onClick={handleCreate}
          whileTap={APPLE_TAP}
          transition={APPLE_SPRING}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New gig
        </motion.button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1.5 hide-scrollbar">
        {gigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No gigs yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a gig to track setlist history</p>
            <motion.button
              type="button"
              onClick={handleCreate}
              whileTap={APPLE_TAP}
              transition={APPLE_SPRING}
              className="mt-4 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
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
                    ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveGigId(isActive ? null : gig.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveGigId(isActive ? null : gig.id);
                    }
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer touch-manipulation"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      isActive ? "bg-emerald-400" : "bg-gray-300"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold text-sm truncate", isActive ? "text-white" : "text-gray-900")}>
                      {gig.title}
                    </p>
                    <p className={cn("text-xs truncate", isActive ? "text-gray-300" : "text-gray-500")}>
                      {formatDate(gig.date)}
                      {gig.venue && ` · ${gig.venue}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {totalScreens > 0 && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {totalScreens} screens
                      </span>
                    )}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : gig.id);
                      }}
                      whileTap={APPLE_TAP}
                      transition={APPLE_SPRING}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isActive ? "text-white/80 hover:bg-white/20" : "text-gray-400 hover:bg-gray-100"
                      )}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <ChevronDown
                        className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")}
                      />
                    </motion.button>
                  </div>
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
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              isActive
                                ? "text-white/90 hover:bg-white/20"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
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
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              isActive
                                ? "text-red-300 hover:bg-red-500/30"
                                : "text-red-600 hover:bg-red-50"
                            )}
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
                                <div
                                  key={h.songId}
                                  className="flex items-center justify-between text-xs py-1"
                                >
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          overlayClassName="backdrop-blur-md bg-black/50"
          className="max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl"
        >
          <DialogHeader>
            <DialogTitle>{editingGig ? "Edit gig" : "New gig"}</DialogTitle>
            <DialogDescription>
              {editingGig
                ? "Update the gig details."
                : "Create a gig to track which songs were played and for how long."}
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
    </div>
  );
});
