import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, GripVertical, Clock, MapPin, Plus, Share2, Sun, Cloud, CloudRain, CloudSun, Star, ArrowLeft, Home, Trash2, Loader2, X, Users, Tent, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gearCategories, weeklyForecast } from "@/lib/mock-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const weatherIcons: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  "cloud-rain": CloudRain,
  cloud: Cloud,
};

interface TripPlan {
  id: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  waypoints: { id: number; name: string; time: string; duration: string }[] | null;
  gearChecklist: { name: string; items: { id: number; name: string; checked: boolean }[] }[] | null;
  createdAt: string;
}

export default function Planner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [addingWaypoint, setAddingWaypoint] = useState(false);
  const [wpName, setWpName] = useState("");
  const [wpTime, setWpTime] = useState("");
  const [wpDuration, setWpDuration] = useState("");

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingCampground, setBookingCampground] = useState<any | null>(null);
  const [bookingCheckIn, setBookingCheckIn] = useState("");
  const [bookingCheckOut, setBookingCheckOut] = useState("");
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingSiteType, setBookingSiteType] = useState("tent");
  const [bookingNotes, setBookingNotes] = useState("");

  const { data: tripsData, isLoading: tripsLoading } = useQuery({ queryKey: ['/api/user/trips'] });
  const trips = (tripsData || []) as TripPlan[];

  const { data: campgroundsData } = useQuery({ queryKey: ['/api/campgrounds'] });
  const campgrounds = (campgroundsData || []) as any[];

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({ queryKey: ['/api/bookings'] });
  const bookings = (bookingsData || []) as any[];

  const bookingNights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const bookingTotalPrice = useMemo(() => {
    if (!bookingCampground || bookingNights <= 0) return 0;
    return bookingCampground.price * bookingNights;
  }, [bookingCampground, bookingNights]);

  const openBookingDialog = (cg: any) => {
    setBookingCampground(cg);
    setBookingCheckIn("");
    setBookingCheckOut("");
    setBookingGuests(1);
    setBookingSiteType("tent");
    setBookingNotes("");
    setBookingDialogOpen(true);
  };

  const createBooking = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setBookingDialogOpen(false);
      toast({ title: "Booking confirmed", description: "Your campground reservation has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create booking.", variant: "destructive" });
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, { status: "cancelled" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: "Booking cancelled", description: "Your reservation has been cancelled." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
    },
  });

  const handleConfirmBooking = () => {
    if (!bookingCampground || !bookingCheckIn || !bookingCheckOut || bookingNights <= 0) return;
    createBooking.mutate({
      userId: user?.id,
      campgroundId: bookingCampground.id,
      checkIn: bookingCheckIn,
      checkOut: bookingCheckOut,
      guests: bookingGuests,
      siteType: bookingSiteType,
      totalPrice: bookingTotalPrice,
      notes: bookingNotes || null,
    });
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "cancelled": return "bg-red-500/15 text-red-600 border-red-500/30";
      case "completed": return "bg-slate-500/15 text-slate-600 border-slate-500/30";
      default: return "";
    }
  };

  const createTrip = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/user/trips", data);
      return res.json();
    },
    onSuccess: (newTrip) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/trips'] });
      setShowCreateForm(false);
      setSelectedTrip(newTrip);
      setNewTitle("");
      setNewDescription("");
      setNewStartDate("");
      setNewEndDate("");
      toast({ title: "Trip created", description: "Your trip plan has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create trip plan.", variant: "destructive" });
    },
  });

  const updateTrip = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/user/trips/${id}`, data);
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/trips'] });
      setSelectedTrip(updated);
    },
  });

  const deleteTrip = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/user/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/trips'] });
      setSelectedTrip(null);
      toast({ title: "Trip deleted", description: "Your trip plan has been removed." });
    },
  });

  const handleCreateTrip = () => {
    if (!newTitle.trim()) return;
    createTrip.mutate({
      title: newTitle,
      description: newDescription || null,
      startDate: newStartDate || null,
      endDate: newEndDate || null,
      waypoints: [],
      gearChecklist: gearCategories.map(cat => ({
        name: cat.name,
        items: cat.items.map(item => ({ ...item, checked: false })),
      })),
    });
  };

  const addWaypoint = () => {
    if (!selectedTrip || !wpName.trim()) return;
    const newWaypoints = [
      ...(selectedTrip.waypoints || []),
      { id: Date.now(), name: wpName, time: wpTime || "TBD", duration: wpDuration || "TBD" },
    ];
    updateTrip.mutate({ id: selectedTrip.id, data: { waypoints: newWaypoints } });
    setWpName("");
    setWpTime("");
    setWpDuration("");
    setAddingWaypoint(false);
  };

  const removeWaypoint = (wpId: number) => {
    if (!selectedTrip) return;
    const newWaypoints = (selectedTrip.waypoints || []).filter(w => w.id !== wpId);
    updateTrip.mutate({ id: selectedTrip.id, data: { waypoints: newWaypoints } });
  };

  const toggleGearItem = (categoryName: string, itemId: number) => {
    if (!selectedTrip) return;
    const newChecklist = (selectedTrip.gearChecklist || []).map(cat => {
      if (cat.name !== categoryName) return cat;
      return {
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      };
    });
    updateTrip.mutate({ id: selectedTrip.id, data: { gearChecklist: newChecklist } });
  };

  const waypoints = selectedTrip?.waypoints || [];
  const checklist = selectedTrip?.gearChecklist || gearCategories;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <div className="lg:hidden flex items-center gap-2 mb-6">
        <Link href="/explore">
          <Button size="icon" variant="ghost" data-testid="button-back-planner">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/">
          <Button size="icon" variant="ghost" data-testid="button-home-planner">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trip Planner</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {selectedTrip ? selectedTrip.title : "Create and manage your outdoor adventures"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedTrip && (
            <>
              <Button variant="outline" onClick={() => setSelectedTrip(null)} className="gap-2 text-xs" data-testid="button-back-trips">
                <ArrowLeft className="w-3.5 h-3.5" /> All Trips
              </Button>
              <Button variant="outline" className="gap-2 text-xs text-red-500 border-red-500/30" onClick={() => deleteTrip.mutate(selectedTrip.id)} data-testid="button-delete-trip">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </>
          )}
          {!selectedTrip && !showCreateForm && (
            <Button className="bg-emerald-500 text-white gap-2" onClick={() => setShowCreateForm(true)} data-testid="button-new-trip">
              <Plus className="w-4 h-4" /> New Trip
            </Button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showCreateForm && !selectedTrip && (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-2xl bg-card border border-card-border p-6 mb-8"
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-foreground">Create New Trip</h2>
              <Button size="icon" variant="ghost" onClick={() => setShowCreateForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Trip Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Great Smoky Mountains Weekend"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-trip-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Describe your adventure..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 resize-none"
                  data-testid="input-trip-description"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-emerald-500"
                    data-testid="input-trip-start"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">End Date</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={e => setNewEndDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-emerald-500"
                    data-testid="input-trip-end"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button className="bg-emerald-500 text-white gap-2" onClick={handleCreateTrip} disabled={createTrip.isPending || !newTitle.trim()} data-testid="button-create-trip">
                  {createTrip.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Trip
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}

        {!selectedTrip && !showCreateForm && (
          <motion.div key="trip-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {tripsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-20">
                <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No trips yet</h3>
                <p className="text-sm text-muted-foreground mb-6">Create your first trip plan to get started</p>
                <Button className="bg-emerald-500 text-white gap-2" onClick={() => setShowCreateForm(true)} data-testid="button-create-first-trip">
                  <Plus className="w-4 h-4" /> Create Trip
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTrip(trip)}
                    className="rounded-2xl bg-card border border-card-border p-6 cursor-pointer hover-elevate"
                    data-testid={`card-trip-${trip.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-semibold text-foreground">{trip.title}</h3>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {(trip.waypoints || []).length} stops
                      </Badge>
                    </div>
                    {trip.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{trip.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {trip.startDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {trip.startDate}
                        </span>
                      )}
                      {trip.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> to {trip.endDate}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedTrip && (
          <motion.div key="trip-detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                <div className="rounded-2xl bg-card border border-card-border p-6" data-testid="route-builder">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-500" /> Route Builder
                    </h2>
                    <Button variant="outline" className="gap-1.5 text-xs" onClick={() => setAddingWaypoint(true)} data-testid="button-add-stop">
                      <Plus className="w-3.5 h-3.5" /> Add Stop
                    </Button>
                  </div>

                  {addingWaypoint && (
                    <div className="rounded-xl bg-background border border-border p-4 mb-5 space-y-3">
                      <input
                        type="text"
                        value={wpName}
                        onChange={e => setWpName(e.target.value)}
                        placeholder="Stop name (e.g., Summit Trail Junction)"
                        className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                        data-testid="input-wp-name"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={wpTime}
                          onChange={e => setWpTime(e.target.value)}
                          placeholder="Time (e.g., Day 1 - 9 AM)"
                          className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                          data-testid="input-wp-time"
                        />
                        <input
                          type="text"
                          value={wpDuration}
                          onChange={e => setWpDuration(e.target.value)}
                          placeholder="Duration (e.g., 2.5 hrs)"
                          className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                          data-testid="input-wp-duration"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button className="bg-emerald-500 text-white text-xs gap-1" onClick={addWaypoint} disabled={!wpName.trim()} data-testid="button-save-waypoint">
                          <Plus className="w-3 h-3" /> Add
                        </Button>
                        <Button variant="ghost" className="text-xs" onClick={() => setAddingWaypoint(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {waypoints.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No stops added yet. Click "Add Stop" to build your route.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {waypoints.map((wp, i) => (
                        <div key={wp.id} className="flex items-start gap-4 group" data-testid={`waypoint-${wp.id}`}>
                          <div className="flex flex-col items-center pt-2">
                            <div className={cn(
                              "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0",
                              i === 0 ? "border-emerald-500 bg-emerald-500" :
                              i === waypoints.length - 1 ? "border-red-400 bg-red-400" :
                              "border-emerald-500/50 bg-transparent"
                            )} />
                            {i < waypoints.length - 1 && (
                              <div className="w-0.5 h-14 bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-5">
                            <div className="flex items-center gap-2 mb-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab invisible group-hover:visible" />
                              <h4 className="text-sm font-medium text-foreground">{wp.name}</h4>
                              <button onClick={() => removeWaypoint(wp.id)} className="invisible group-hover:visible ml-auto" data-testid={`button-remove-wp-${wp.id}`}>
                                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {wp.time}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wp.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-card border border-card-border p-6" data-testid="gear-checklist">
                  <h2 className="text-lg font-semibold text-foreground mb-5">Gear Checklist</h2>
                  <Accordion type="multiple" defaultValue={["Clothing", "Safety & Navigation"]} className="w-full">
                    {checklist.map((cat) => (
                      <AccordionItem key={cat.name} value={cat.name}>
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2.5">
                            {cat.name}
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {cat.items.filter(i => i.checked).length}/{cat.items.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2.5">
                            {cat.items.map(item => (
                              <label
                                key={item.id}
                                className="flex items-center gap-3 py-1.5 cursor-pointer"
                                data-testid={`gear-item-${item.id}`}
                              >
                                <Checkbox
                                  checked={item.checked}
                                  onCheckedChange={() => selectedTrip && toggleGearItem(cat.name, item.id)}
                                />
                                <span className={cn("text-sm", item.checked ? "text-muted-foreground line-through" : "text-foreground")}>
                                  {item.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>

              <div className="space-y-6 lg:space-y-8">
                <div className="rounded-2xl bg-card border border-card-border p-6" data-testid="weather-forecast">
                  <h3 className="text-sm font-semibold text-foreground mb-5">7-Day Forecast</h3>
                  <div className="space-y-4">
                    {weeklyForecast.map((day, i) => {
                      const Icon = weatherIcons[day.icon] || Sun;
                      return (
                        <div key={i} className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground w-10">{day.day}</span>
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground w-20 text-center">{day.condition}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-foreground font-medium">{day.high}</span>
                            <span className="text-muted-foreground">{day.low}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div data-testid="campground-section">
                  <h3 className="text-sm font-semibold text-foreground mb-5">Available Campgrounds</h3>
                  <div className="space-y-4">
                    {campgrounds.map(cg => (
                      <div key={cg.id} className="rounded-xl bg-card border border-card-border overflow-hidden" data-testid={`card-campground-${cg.id}`}>
                        <div className="relative h-32">
                          <img src={cg.image} alt={cg.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4">
                            <h4 className="text-white text-sm font-semibold">{cg.name}</h4>
                            <p className="text-white/70 text-xs mt-0.5">{cg.location}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-medium text-foreground">{cg.rating}</span>
                            </div>
                            <span className="text-base font-bold text-emerald-500">${cg.price}<span className="text-xs text-muted-foreground font-normal">/night</span></span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {cg.amenities?.slice(0, 3).map((a: string) => (
                              <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
                            ))}
                            {cg.amenities?.length > 3 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{cg.amenities.length - 3}</Badge>
                            )}
                          </div>
                          <Button className="w-full bg-emerald-500 text-white text-xs" onClick={() => openBookingDialog(cg)} data-testid={`button-reserve-${cg.id}`}>
                            Book
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {user && (
          <motion.div
            key="my-bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
            data-testid="my-bookings-section"
          >
            <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Tent className="w-5 h-5 text-emerald-500" /> My Bookings
            </h2>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Tent className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No bookings yet. Reserve a campground to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookings.map((b: any, i: number) => {
                  const cg = campgrounds.find((c: any) => c.id === b.campgroundId);
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-visible" data-testid={`card-booking-${b.id}`}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h4 className="text-sm font-semibold text-foreground">{cg?.name || `Campground #${b.campgroundId}`}</h4>
                            <Badge variant="outline" className={cn("text-[10px] capitalize", statusBadgeClass(b.status))} data-testid={`badge-status-${b.id}`}>
                              {b.status}
                            </Badge>
                          </div>
                          <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3 h-3" />
                              <span>{b.checkIn} to {b.checkOut}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              <span>{b.guests} guest{b.guests > 1 ? "s" : ""} &middot; {b.siteType}</span>
                            </div>
                            {b.totalPrice != null && (
                              <div className="text-sm font-bold text-emerald-500">${Number(b.totalPrice).toFixed(2)}</div>
                            )}
                          </div>
                          {b.status === "confirmed" && (
                            <Button
                              variant="outline"
                              className="w-full text-xs text-red-500 border-red-500/30 gap-1.5"
                              onClick={() => cancelBooking.mutate(b.id)}
                              disabled={cancelBooking.isPending}
                              data-testid={`button-cancel-booking-${b.id}`}
                            >
                              {cancelBooking.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                              Cancel Booking
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-booking">
          <DialogHeader>
            <DialogTitle className="text-foreground">Book Campground</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {bookingCampground?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Check-in Date</label>
              <input
                type="date"
                value={bookingCheckIn}
                onChange={e => setBookingCheckIn(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-emerald-500"
                data-testid="input-booking-checkin"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Check-out Date</label>
              <input
                type="date"
                value={bookingCheckOut}
                onChange={e => setBookingCheckOut(e.target.value)}
                min={bookingCheckIn || undefined}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-emerald-500"
                data-testid="input-booking-checkout"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Number of Guests</label>
              <input
                type="number"
                min={1}
                max={10}
                value={bookingGuests}
                onChange={e => setBookingGuests(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-emerald-500"
                data-testid="input-booking-guests"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Site Type</label>
              <Select value={bookingSiteType} onValueChange={setBookingSiteType}>
                <SelectTrigger data-testid="select-booking-sitetype">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tent">Tent</SelectItem>
                  <SelectItem value="rv">RV</SelectItem>
                  <SelectItem value="cabin">Cabin</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optional)</label>
              <textarea
                value={bookingNotes}
                onChange={e => setBookingNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={2}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 resize-none"
                data-testid="input-booking-notes"
              />
            </div>

            {bookingNights > 0 && bookingCampground && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4" data-testid="booking-price-summary">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    ${bookingCampground.price}/night &times; {bookingNights} night{bookingNights > 1 ? "s" : ""}
                  </span>
                  <span className="text-lg font-bold text-emerald-500" data-testid="text-booking-total">
                    ${bookingTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-emerald-500 text-white gap-2"
              onClick={handleConfirmBooking}
              disabled={createBooking.isPending || !bookingCheckIn || !bookingCheckOut || bookingNights <= 0}
              data-testid="button-confirm-booking"
            >
              {createBooking.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tent className="w-4 h-4" />}
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
