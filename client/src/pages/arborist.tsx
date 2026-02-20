import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Briefcase, FileText, Plus, Trash2, Search, X, Loader2,
  Phone, Mail, MapPin, Calendar, DollarSign, TreePine, ArrowLeft, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { ArboristClient, ArboristJob, ArboristInvoice } from "@shared/schema";

const jobStatusColors: Record<string, string> = {
  scheduled: "bg-amber-500/15 text-amber-500",
  "in-progress": "bg-emerald-500/15 text-emerald-500",
  completed: "bg-slate-500/15 text-slate-400",
};

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-400",
  sent: "bg-amber-500/15 text-amber-500",
  paid: "bg-emerald-500/15 text-emerald-500",
  overdue: "bg-red-500/15 text-red-500",
};

export default function Arborist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("clients");

  const { data: clientsData, isLoading: clientsLoading } = useQuery<ArboristClient[]>({
    queryKey: ["/api/arborist/clients"],
  });
  const clients = clientsData || [];

  const { data: jobsData, isLoading: jobsLoading } = useQuery<ArboristJob[]>({
    queryKey: ["/api/arborist/jobs"],
  });
  const jobs = jobsData || [];

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<ArboristInvoice[]>({
    queryKey: ["/api/arborist/invoices"],
  });
  const invoices = invoicesData || [];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <div className="lg:hidden flex items-center gap-2 mb-6">
        <Link href="/explore">
          <Button size="icon" variant="ghost" data-testid="button-back-arborist">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/">
          <Button size="icon" variant="ghost" data-testid="button-home-arborist">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <TreePine className="w-7 h-7 text-emerald-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-arborist-title">
            Arborist Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage your clients, jobs, and invoices</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-arborist">
        <TabsList className="mb-6">
          <TabsTrigger value="clients" className="gap-1.5" data-testid="tab-clients">
            <Users className="w-4 h-4" /> Clients
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-1.5" data-testid="tab-jobs">
            <Briefcase className="w-4 h-4" /> Jobs
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5" data-testid="tab-invoices">
            <FileText className="w-4 h-4" /> Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <ClientsTab clients={clients} isLoading={clientsLoading} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsTab jobs={jobs} clients={clients} isLoading={jobsLoading} />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesTab invoices={invoices} clients={clients} isLoading={invoicesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClientsTab({ clients, isLoading }: { clients: ArboristClient[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q)) ||
      (c.phone?.toLowerCase().includes(q)) ||
      (c.address?.toLowerCase().includes(q))
    );
  });

  const createClient = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/arborist/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arborist/clients"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Client added", description: "New client has been created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add client.", variant: "destructive" });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/arborist/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arborist/clients"] });
      toast({ title: "Client removed", description: "Client has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    createClient.mutate({
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-clients"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 text-white gap-1.5" data-testid="button-add-client">
              <Plus className="w-4 h-4" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-client">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" data-testid="input-client-name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" data-testid="input-client-email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" data-testid="input-client-phone" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST" data-testid="input-client-address" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." data-testid="input-client-notes" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="bg-emerald-500 text-white gap-1.5"
                  onClick={handleSubmit}
                  disabled={createClient.isPending || !name.trim()}
                  data-testid="button-submit-client"
                >
                  {createClient.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Client
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No clients yet</h3>
          <p className="text-sm text-muted-foreground">Add your first client to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-5" data-testid={`card-client-${client.id}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-foreground" data-testid={`text-client-name-${client.id}`}>
                    {client.name}
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteClient.mutate(client.id)}
                    disabled={deleteClient.isPending}
                    data-testid={`button-delete-client-${client.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span data-testid={`text-client-email-${client.id}`}>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span data-testid={`text-client-phone-${client.id}`}>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span data-testid={`text-client-address-${client.id}`}>{client.address}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function JobsTab({ jobs, clients, isLoading }: { jobs: ArboristJob[]; clients: ArboristClient[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [crew, setCrew] = useState("");
  const [notes, setNotes] = useState("");

  const createJob = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/arborist/jobs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arborist/jobs"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Job created", description: "New job has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create job.", variant: "destructive" });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/arborist/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arborist/jobs"] });
      toast({ title: "Job removed", description: "Job has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTitle("");
    setClientId("");
    setDescription("");
    setScheduledDate("");
    setEstimatedCost("");
    setCrew("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    createJob.mutate({
      title: title.trim(),
      clientId: clientId ? parseInt(clientId) : null,
      description: description || null,
      scheduledDate: scheduledDate || null,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      crew: crew ? crew.split(",").map((c) => c.trim()).filter(Boolean) : [],
      notes: notes || null,
      status: "scheduled",
    });
  };

  const getClientName = (cId: number | null) => {
    if (!cId) return null;
    return clients.find((c) => c.id === cId)?.name || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-foreground flex-1">{jobs.length} Jobs</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 text-white gap-1.5" data-testid="button-add-job">
              <Plus className="w-4 h-4" /> Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto" data-testid="dialog-add-job">
            <DialogHeader>
              <DialogTitle>Add New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" data-testid="input-job-title" />
              </div>
              <div>
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger data-testid="select-job-client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job description..." data-testid="input-job-description" />
              </div>
              <div>
                <Label>Scheduled Date</Label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} data-testid="input-job-date" />
              </div>
              <div>
                <Label>Estimated Cost ($)</Label>
                <Input type="number" step="0.01" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="0.00" data-testid="input-job-cost" />
              </div>
              <div>
                <Label>Crew (comma-separated)</Label>
                <Input value={crew} onChange={(e) => setCrew(e.target.value)} placeholder="John, Jane, Mike" data-testid="input-job-crew" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." data-testid="input-job-notes" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="bg-emerald-500 text-white gap-1.5"
                  onClick={handleSubmit}
                  disabled={createJob.isPending || !title.trim()}
                  data-testid="button-submit-job"
                >
                  {createJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Job
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No jobs yet</h3>
          <p className="text-sm text-muted-foreground">Create your first job to start tracking work</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-5" data-testid={`card-job-${job.id}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate" data-testid={`text-job-title-${job.id}`}>
                      {job.title}
                    </h3>
                    {getClientName(job.clientId) && (
                      <p className="text-xs text-muted-foreground mt-0.5">{getClientName(job.clientId)}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteJob.mutate(job.id)}
                    disabled={deleteJob.isPending}
                    data-testid={`button-delete-job-${job.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={jobStatusColors[job.status || "scheduled"]} data-testid={`badge-job-status-${job.id}`}>
                    {job.status || "scheduled"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {job.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span data-testid={`text-job-date-${job.id}`}>{job.scheduledDate}</span>
                    </div>
                  )}
                  {job.estimatedCost != null && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                      <span data-testid={`text-job-cost-${job.id}`}>${Number(job.estimatedCost).toFixed(2)}</span>
                    </div>
                  )}
                  {job.crew && job.crew.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{job.crew.join(", ")}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function InvoicesTab({ invoices, clients, isLoading }: { invoices: ArboristInvoice[]; clients: ArboristClient[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ description: string; quantity: string; unitPrice: string }[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);

  const createInvoice = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/arborist/invoices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arborist/invoices"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Invoice created", description: "New invoice has been generated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create invoice.", variant: "destructive" });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/arborist/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arborist/invoices"] });
      toast({ title: "Invoice removed", description: "Invoice has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setClientId("");
    setDueDate("");
    setTaxRate("");
    setNotes("");
    setItems([{ description: "", quantity: "1", unitPrice: "" }]);
  };

  const addLineItem = () => {
    setItems([...items, { description: "", quantity: "1", unitPrice: "" }]);
  };

  const removeLineItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const tax = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const total = subtotal + tax;

  const handleSubmit = () => {
    const validItems = items.filter((item) => item.description.trim() && parseFloat(item.unitPrice) > 0);
    if (validItems.length === 0) return;

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    createInvoice.mutate({
      clientId: clientId ? parseInt(clientId) : null,
      invoiceNumber,
      status: "draft",
      items: validItems.map((item) => ({
        description: item.description.trim(),
        quantity: parseFloat(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
      })),
      subtotal,
      tax,
      total,
      dueDate: dueDate || null,
      notes: notes || null,
    });
  };

  const getClientName = (cId: number | null) => {
    if (!cId) return null;
    return clients.find((c) => c.id === cId)?.name || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-foreground flex-1">{invoices.length} Invoices</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 text-white gap-1.5" data-testid="button-create-invoice">
              <Plus className="w-4 h-4" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" data-testid="dialog-create-invoice">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger data-testid="select-invoice-client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Label>Line Items</Label>
                  <Button variant="outline" size="sm" onClick={addLineItem} className="gap-1 text-xs" data-testid="button-add-line-item">
                    <Plus className="w-3 h-3" /> Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2" data-testid={`line-item-${index}`}>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, "description", e.target.value)}
                          data-testid={`input-line-desc-${index}`}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                            className="w-20"
                            data-testid={`input-line-qty-${index}`}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                            data-testid={`input-line-price-${index}`}
                          />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeLineItem(index)}
                          data-testid={`button-remove-line-${index}`}
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} data-testid="input-invoice-due-date" />
                </div>
                <div className="w-24">
                  <Label>Tax %</Label>
                  <Input type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0" data-testid="input-invoice-tax" />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Invoice notes..." data-testid="input-invoice-notes" />
              </div>

              <div className="rounded-md bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium" data-testid="text-invoice-subtotal">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground font-medium" data-testid="text-invoice-tax">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-1">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-emerald-500 font-bold" data-testid="text-invoice-total">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="bg-emerald-500 text-white gap-1.5"
                  onClick={handleSubmit}
                  disabled={createInvoice.isPending || items.every((i) => !i.description.trim())}
                  data-testid="button-submit-invoice"
                >
                  {createInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Create Invoice
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No invoices yet</h3>
          <p className="text-sm text-muted-foreground">Create your first invoice to start billing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((invoice, i) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-5" data-testid={`card-invoice-${invoice.id}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground" data-testid={`text-invoice-number-${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </h3>
                    {getClientName(invoice.clientId) && (
                      <p className="text-xs text-muted-foreground mt-0.5">{getClientName(invoice.clientId)}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteInvoice.mutate(invoice.id)}
                    disabled={deleteInvoice.isPending}
                    data-testid={`button-delete-invoice-${invoice.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={invoiceStatusColors[invoice.status || "draft"]} data-testid={`badge-invoice-status-${invoice.id}`}>
                    {invoice.status || "draft"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>Total</span>
                    <span className="text-emerald-500 font-bold text-sm" data-testid={`text-invoice-total-${invoice.id}`}>
                      ${Number(invoice.total || 0).toFixed(2)}
                    </span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span data-testid={`text-invoice-due-${invoice.id}`}>Due: {invoice.dueDate}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
