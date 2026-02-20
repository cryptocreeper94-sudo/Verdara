import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wrench, Plus, Loader2, Pencil, Trash2, Clock, Fuel, Calendar,
  DollarSign, AlertTriangle, CheckCircle, Settings, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  hours: number | null;
  status: string;
  fuelType: string | null;
  lastServiceDate: string | null;
  nextServiceDue: string | null;
  notes: string | null;
}

const equipmentTypes = ["Chainsaw", "ATV", "E-Bike", "Boat", "Snowmobile", "Generator", "Pressure Washer", "Other"];
const statusOptions = ["operational", "needs_service", "in_repair", "retired"];
const fuelTypes = ["Gas", "Diesel", "Electric", "Hybrid", "N/A"];

const statusColors: Record<string, string> = {
  operational: "bg-emerald-500/15 text-emerald-400",
  needs_service: "bg-amber-500/15 text-amber-400",
  in_repair: "bg-orange-500/15 text-orange-400",
  retired: "bg-slate-500/15 text-slate-400",
};

const statusLabels: Record<string, string> = {
  operational: "Operational",
  needs_service: "Needs Service",
  in_repair: "In Repair",
  retired: "Retired",
};

function getDefaultForm() {
  return {
    name: "",
    type: "",
    brand: "",
    model: "",
    year: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    hours: "",
    status: "operational",
    fuelType: "",
    lastServiceDate: "",
    nextServiceDue: "",
    notes: "",
  };
}

export default function GarageBot() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState(getDefaultForm);

  const { data, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const equipment = data || [];

  const stats = useMemo(() => {
    const total = equipment.length;
    const needsService = equipment.filter(e => e.status === "needs_service").length;
    const totalValue = equipment.reduce((sum, e) => sum + (e.purchasePrice || 0), 0);
    return { total, needsService, totalValue };
  }, [equipment]);

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/equipment", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setAddOpen(false);
      setForm(getDefaultForm());
      toast({ title: "Equipment added", description: "New equipment has been added to your garage." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add equipment.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/equipment/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setEditOpen(false);
      setEditId(null);
      setForm(getDefaultForm());
      toast({ title: "Equipment updated", description: "Equipment details have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update equipment.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setDeleteConfirm(null);
      toast({ title: "Equipment removed", description: "Equipment has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete equipment.", variant: "destructive" });
    },
  });

  const setField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    type: form.type || null,
    brand: form.brand || null,
    model: form.model || null,
    year: form.year ? parseInt(form.year) : null,
    serialNumber: form.serialNumber || null,
    purchaseDate: form.purchaseDate || null,
    purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
    hours: form.hours ? parseFloat(form.hours) : null,
    status: form.status || "operational",
    fuelType: form.fuelType || null,
    lastServiceDate: form.lastServiceDate || null,
    nextServiceDue: form.nextServiceDue || null,
    notes: form.notes || null,
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createMutation.mutate(buildPayload());
  };

  const handleEdit = () => {
    if (!form.name.trim() || editId == null) return;
    updateMutation.mutate({ id: editId, payload: buildPayload() });
  };

  const openEditDialog = (item: Equipment) => {
    setEditId(item.id);
    setForm({
      name: item.name || "",
      type: item.type || "",
      brand: item.brand || "",
      model: item.model || "",
      year: item.year != null ? String(item.year) : "",
      serialNumber: item.serialNumber || "",
      purchaseDate: item.purchaseDate || "",
      purchasePrice: item.purchasePrice != null ? String(item.purchasePrice) : "",
      hours: item.hours != null ? String(item.hours) : "",
      status: item.status || "operational",
      fuelType: item.fuelType || "",
      lastServiceDate: item.lastServiceDate || "",
      nextServiceDue: item.nextServiceDue || "",
      notes: item.notes || "",
    });
    setEditOpen(true);
  };

  const formFields = (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Equipment name" data-testid="input-equipment-name" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => setField("type", v)}>
            <SelectTrigger data-testid="select-equipment-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Brand</Label>
          <Input value={form.brand} onChange={e => setField("brand", e.target.value)} placeholder="Brand" data-testid="input-equipment-brand" />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={form.model} onChange={e => setField("model", e.target.value)} placeholder="Model" data-testid="input-equipment-model" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Year</Label>
          <Input type="number" value={form.year} onChange={e => setField("year", e.target.value)} placeholder="2024" data-testid="input-equipment-year" />
        </div>
        <div>
          <Label>Serial Number</Label>
          <Input value={form.serialNumber} onChange={e => setField("serialNumber", e.target.value)} placeholder="Serial number" data-testid="input-equipment-serial" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Purchase Date</Label>
          <Input type="date" value={form.purchaseDate} onChange={e => setField("purchaseDate", e.target.value)} data-testid="input-equipment-purchase-date" />
        </div>
        <div>
          <Label>Purchase Price ($)</Label>
          <Input type="number" step="0.01" value={form.purchasePrice} onChange={e => setField("purchasePrice", e.target.value)} placeholder="0.00" data-testid="input-equipment-price" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Hours</Label>
          <Input type="number" step="0.1" value={form.hours} onChange={e => setField("hours", e.target.value)} placeholder="0" data-testid="input-equipment-hours" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setField("status", v)}>
            <SelectTrigger data-testid="select-equipment-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(s => (
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fuel Type</Label>
          <Select value={form.fuelType} onValueChange={v => setField("fuelType", v)}>
            <SelectTrigger data-testid="select-equipment-fuel">
              <SelectValue placeholder="Fuel type" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Last Service Date</Label>
          <Input type="date" value={form.lastServiceDate} onChange={e => setField("lastServiceDate", e.target.value)} data-testid="input-equipment-last-service" />
        </div>
        <div>
          <Label>Next Service Due</Label>
          <Input type="date" value={form.nextServiceDue} onChange={e => setField("nextServiceDue", e.target.value)} data-testid="input-equipment-next-service" />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Additional notes..." data-testid="input-equipment-notes" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="page-garagebot">
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="/images/cat-emobility.jpg"
          alt="GarageBot Equipment"
          className="w-full h-full object-cover"
          data-testid="img-hero-garagebot"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" data-testid="text-page-title">
              GarageBot Equipment
            </h1>
          </div>
          <p className="text-white/70 text-sm mt-1 drop-shadow max-w-lg" data-testid="text-page-description">
            Track and manage your motorized and power equipment. Keep tabs on service schedules, hours logged, and maintenance for chainsaws, ATVs, e-bikes, boats, and more.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <div className="grid grid-cols-3 gap-3 max-w-lg mb-6">
          <div className="rounded-xl bg-card border border-card-border p-3 text-center" data-testid="stat-total">
            <div className="text-lg font-bold text-emerald-500">{stats.total}</div>
            <div className="text-[11px] text-muted-foreground">Total Items</div>
          </div>
          <div className="rounded-xl bg-card border border-card-border p-3 text-center" data-testid="stat-needs-service">
            <div className="text-lg font-bold text-amber-500">{stats.needsService}</div>
            <div className="text-[11px] text-muted-foreground">Needs Service</div>
          </div>
          <div className="rounded-xl bg-card border border-card-border p-3 text-center" data-testid="stat-total-value">
            <div className="text-lg font-bold text-slate-400">${stats.totalValue.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground">Total Value</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (open) setForm(getDefaultForm()); }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 text-white gap-1.5" data-testid="button-add-equipment">
                <Plus className="w-4 h-4" /> Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" data-testid="dialog-add-equipment">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              {formFields}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="bg-emerald-500 text-white gap-1.5"
                  onClick={handleAdd}
                  disabled={createMutation.isPending || !form.name.trim()}
                  data-testid="button-submit-equipment"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Equipment
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditId(null); setForm(getDefaultForm()); } }}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" data-testid="dialog-edit-equipment">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
            </DialogHeader>
            {formFields}
            <div className="flex items-center gap-3 pt-2">
              <Button
                className="bg-emerald-500 text-white gap-1.5"
                onClick={handleEdit}
                disabled={updateMutation.isPending || !form.name.trim()}
                data-testid="button-update-equipment"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                Update Equipment
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <DialogContent data-testid="dialog-delete-confirm">
            <DialogHeader>
              <DialogTitle>Delete Equipment</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this equipment? This action cannot be undone.</p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={() => { if (deleteConfirm !== null) deleteMutation.mutate(deleteConfirm); }}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {equipment.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Settings className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-empty-state">No equipment yet</h3>
            <p className="text-sm text-muted-foreground">Add your first piece of equipment to start tracking</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipment.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card
                  className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm"
                  data-testid={`card-equipment-${item.id}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate" data-testid={`text-equipment-name-${item.id}`}>
                          {item.name}
                        </h3>
                        {(item.brand || item.model) && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate" data-testid={`text-equipment-brand-${item.id}`}>
                            {[item.brand, item.model].filter(Boolean).join(" ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(item)}
                          data-testid={`button-edit-equipment-${item.id}`}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(item.id)}
                          data-testid={`button-delete-equipment-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.type && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 text-xs" data-testid={`badge-type-${item.id}`}>
                          {item.type}
                        </Badge>
                      )}
                      <Badge className={`${statusColors[item.status] || statusColors.operational} text-xs`} data-testid={`badge-status-${item.id}`}>
                        {statusLabels[item.status] || item.status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {item.hours != null && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span data-testid={`text-hours-${item.id}`}>{item.hours} hours logged</span>
                        </div>
                      )}
                      {item.fuelType && (
                        <div className="flex items-center gap-2">
                          <Fuel className="w-3.5 h-3.5 flex-shrink-0" />
                          <span data-testid={`text-fuel-${item.id}`}>{item.fuelType}</span>
                        </div>
                      )}
                      {item.lastServiceDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                          <span data-testid={`text-last-service-${item.id}`}>Last service: {item.lastServiceDate}</span>
                        </div>
                      )}
                      {item.nextServiceDue && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                          <span data-testid={`text-next-service-${item.id}`}>Next service: {item.nextServiceDue}</span>
                        </div>
                      )}
                      {item.purchasePrice != null && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                          <span data-testid={`text-price-${item.id}`}>${Number(item.purchasePrice).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}