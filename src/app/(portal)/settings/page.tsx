'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Download,
  UserPlus,
  Trash2,
  ShieldCheck,
  Crown,
} from 'lucide-react'

// --- Toggle Switch ---

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-torii' : 'bg-muted-gray/40'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

// --- Form Field ---

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-charcoal">{label}</label>
      {children}
    </div>
  )
}

// --- Profile Tab ---

function ProfileTab() {
  return (
    <div className="bg-white rounded-tenkai border border-tenkai-border p-6 space-y-6 max-w-xl">
      <div>
        <h3 className="font-serif text-lg text-charcoal">Business Profile</h3>
        <p className="text-warm-gray text-sm mt-1">
          Update your business information
        </p>
      </div>
      <div className="space-y-4">
        <FormField label="Business Name">
          <Input
            defaultValue="Premier Plumbing Co."
            className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </FormField>
        <FormField label="Website URL">
          <Input
            defaultValue="https://premierplumbing.com"
            className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </FormField>
        <FormField label="Industry">
          <Input
            defaultValue="Home Services / Plumbing"
            className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </FormField>
        <FormField label="Contact Email">
          <Input
            defaultValue="sarah@premierplumbing.com"
            className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </FormField>
      </div>
      <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai">
        Save Changes
      </Button>
    </div>
  )
}

// --- Billing Tab ---

const billingHistory = [
  { date: 'Mar 1, 2026', amount: '$149.00', status: 'Paid', invoice: '#INV-2026-003' },
  { date: 'Feb 1, 2026', amount: '$149.00', status: 'Paid', invoice: '#INV-2026-002' },
  { date: 'Jan 1, 2026', amount: '$149.00', status: 'Paid', invoice: '#INV-2026-001' },
  { date: 'Dec 1, 2025', amount: '$149.00', status: 'Paid', invoice: '#INV-2025-012' },
]

function BillingTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current Plan */}
      <div className="bg-white rounded-tenkai border border-tenkai-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-torii/10 flex items-center justify-center">
              <Crown className="size-5 text-torii" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-charcoal">Growth Plan</h3>
              <p className="text-warm-gray text-sm">$149/month &middot; Renews Apr 1, 2026</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-tenkai-border text-charcoal hover:bg-parchment rounded-tenkai text-sm"
          >
            Change Plan
          </Button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-tenkai border border-tenkai-border p-6">
        <h3 className="font-medium text-charcoal mb-3">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-tenkai bg-parchment/60 flex items-center justify-center">
              <CreditCard className="size-5 text-warm-gray" />
            </div>
            <div>
              <p className="text-sm text-charcoal font-medium">Visa ending in 4242</p>
              <p className="text-xs text-warm-gray">Expires 12/2027</p>
            </div>
          </div>
          <button className="text-sm text-torii hover:text-torii-dark font-medium">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-tenkai border border-tenkai-border overflow-hidden">
        <div className="px-6 py-4 border-b border-tenkai-border">
          <h3 className="font-medium text-charcoal">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tenkai-border bg-cream/50">
                <th className="text-left px-6 py-3 font-medium text-warm-gray">Date</th>
                <th className="text-left px-6 py-3 font-medium text-warm-gray">Amount</th>
                <th className="text-left px-6 py-3 font-medium text-warm-gray hidden sm:table-cell">Status</th>
                <th className="text-right px-6 py-3 font-medium text-warm-gray">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-tenkai-border/50 last:border-0"
                >
                  <td className="px-6 py-3 text-charcoal">{row.date}</td>
                  <td className="px-6 py-3 text-charcoal font-medium tabular-nums">{row.amount}</td>
                  <td className="px-6 py-3 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#4A7C59]/10 text-[#4A7C59]">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-torii hover:text-torii-dark text-sm font-medium inline-flex items-center gap-1">
                      <Download className="size-3.5" />
                      {row.invoice}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-warm-gray">
          <ShieldCheck className="size-4" />
          14-day money-back guarantee
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <button className="text-sm text-warm-gray hover:text-torii transition-colors" />
            }
          >
            Cancel subscription
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-ivory">
            <DialogHeader>
              <DialogTitle className="font-serif text-charcoal">Cancel your subscription?</DialogTitle>
              <DialogDescription>
                Your team will lose access to all Tenkai features at the end of the current billing
                period. Any in-progress content will be paused.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="border-tenkai-border rounded-tenkai"
                  />
                }
              >
                Keep my plan
              </DialogClose>
              <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai">
                Yes, cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// --- Team Tab ---

const teamMembers = [
  { name: 'Sarah Chen', email: 'sarah@premierplumbing.com', role: 'Admin', initials: 'SC' },
  { name: 'Mike Rodriguez', email: 'mike@premierplumbing.com', role: 'Editor', initials: 'MR' },
  { name: 'Lisa Park', email: 'lisa@premierplumbing.com', role: 'Viewer', initials: 'LP' },
]

function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Viewer')

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Members List */}
      <div className="bg-white rounded-tenkai border border-tenkai-border overflow-hidden">
        <div className="px-6 py-4 border-b border-tenkai-border">
          <h3 className="font-medium text-charcoal">Team Members</h3>
        </div>
        <div className="divide-y divide-tenkai-border/50">
          {teamMembers.map((member) => (
            <div
              key={member.email}
              className="px-6 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
                  <span className="text-torii text-xs font-semibold">{member.initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{member.name}</p>
                  <p className="text-xs text-warm-gray truncate">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                    member.role === 'Admin'
                      ? 'bg-torii/10 text-torii border-torii/20'
                      : member.role === 'Editor'
                        ? 'bg-[#C49A3C]/10 text-[#C49A3C] border-[#C49A3C]/20'
                        : 'bg-warm-gray/10 text-warm-gray border-warm-gray/20'
                  )}
                >
                  {member.role}
                </span>
                {member.role !== 'Admin' && (
                  <button className="text-warm-gray hover:text-torii transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white rounded-tenkai border border-tenkai-border p-6 space-y-4">
        <h3 className="font-medium text-charcoal">Invite Team Member</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail((e.target as HTMLInputElement).value)}
            className="flex-1 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-8 px-3 rounded-tenkai border border-tenkai-border bg-transparent text-sm text-charcoal outline-none focus:border-torii focus:ring-2 focus:ring-torii/20"
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
          <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5 flex-shrink-0">
            <UserPlus className="size-4" />
            Invite
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Notifications Tab ---

interface NotificationSetting {
  id: string
  label: string
  description: string
  defaultOn: boolean
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'content-approval',
    label: 'Content ready for approval',
    description: 'Get notified when your team creates content that needs your review',
    defaultOn: true,
  },
  {
    id: 'weekly-summary',
    label: 'Weekly performance summary',
    description: 'A digest of your key SEO metrics every Monday morning',
    defaultOn: true,
  },
  {
    id: 'ranking-changes',
    label: 'Ranking changes (significant moves)',
    description: 'Alerts when tracked keywords move 5+ positions up or down',
    defaultOn: true,
  },
  {
    id: 'audit-findings',
    label: 'New audit findings',
    description: 'Notified when Yuki finds new technical SEO issues on your site',
    defaultOn: false,
  },
  {
    id: 'billing-receipts',
    label: 'Monthly billing receipts',
    description: 'Receive payment confirmations and invoices via email',
    defaultOn: true,
  },
]

function NotificationsTab() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(
      notificationSettings.map((s) => [s.id, s.defaultOn])
    )
  )

  const toggle = (id: string) =>
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="bg-white rounded-tenkai border border-tenkai-border divide-y divide-tenkai-border/50 max-w-xl">
      {notificationSettings.map((setting) => (
        <div
          key={setting.id}
          className="px-6 py-5 flex items-start justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-charcoal">{setting.label}</p>
            <p className="text-xs text-warm-gray leading-relaxed">
              {setting.description}
            </p>
          </div>
          <Toggle
            checked={settings[setting.id]}
            onChange={() => toggle(setting.id)}
          />
        </div>
      ))}
    </div>
  )
}

// --- Main Page ---

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-charcoal">Settings</h2>
        <p className="text-warm-gray text-sm mt-1">
          Manage your account, billing, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-parchment/60 border border-tenkai-border rounded-tenkai">
          <TabsTrigger
            value="profile"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Team
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <TeamTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
