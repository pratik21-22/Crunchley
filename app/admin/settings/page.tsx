"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminHeader } from "@/components/layout/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" })
        const json = await response.json()

        if (!response.ok || !json?.success) {
          throw new Error(json?.error || "Failed to load settings")
        }

        setSettings(json.data as SiteSettings)
      } catch {
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }

    void loadSettings()
  }, [])

  const updateField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const json = await response.json()
      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to save settings")
      }

      setSettings(json.data as SiteSettings)
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminHeader title="Settings" description="Store operations and launch readiness" />

      <div className="space-y-6 p-4 lg:p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-sm text-muted-foreground">
            {loading ? "Loading current settings..." : "Changes here persist to MongoDB and are reflected on the public contact and enquiry surfaces."}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Store Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(event) => updateField("storeName", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(event) => updateField("supportEmail", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={settings.supportPhone}
                onChange={(event) => updateField("supportPhone", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supportAddress">Support Address</Label>
              <Textarea
                id="supportAddress"
                value={settings.supportAddress}
                onChange={(event) => updateField("supportAddress", event.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline}
                onChange={(event) => updateField("tagline", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="helpText">Help Text</Label>
              <Textarea
                id="helpText"
                value={settings.helpText}
                onChange={(event) => updateField("helpText", event.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeMessage">Store Messaging</Label>
              <Textarea
                id="storeMessage"
                value={settings.storeMessage}
                onChange={(event) => updateField("storeMessage", event.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Footer and Social</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="copyrightText">Copyright Text</Label>
              <Input
                id="copyrightText"
                value={settings.copyrightText}
                onChange={(event) => updateField("copyrightText", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialInstagram">Instagram URL</Label>
              <Input
                id="socialInstagram"
                value={settings.socialInstagram}
                onChange={(event) => updateField("socialInstagram", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialFacebook">Facebook URL</Label>
              <Input
                id="socialFacebook"
                value={settings.socialFacebook}
                onChange={(event) => updateField("socialFacebook", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="socialYoutube">YouTube URL</Label>
              <Input
                id="socialYoutube"
                value={settings.socialYoutube}
                onChange={(event) => updateField("socialYoutube", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Shipping and Fulfillment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingNote">Shipping Note</Label>
              <Textarea
                id="shippingNote"
                value={settings.shippingNote}
                onChange={(event) => updateField("shippingNote", event.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="autoConfirmPaidOrders" className="text-sm">Auto-confirm paid orders</Label>
                <Switch
                  id="autoConfirmPaidOrders"
                  checked={settings.autoConfirmPaidOrders}
                  onCheckedChange={(checked) => updateField("autoConfirmPaidOrders", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="sendShipmentNotifications" className="text-sm">Shipment notifications</Label>
                <Switch
                  id="sendShipmentNotifications"
                  checked={settings.sendShipmentNotifications}
                  onCheckedChange={(checked) => updateField("sendShipmentNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="allowCod" className="text-sm">Enable COD</Label>
                <Switch
                  id="allowCod"
                  checked={settings.allowCod}
                  onCheckedChange={(checked) => updateField("allowCod", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Analytics (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dashboard and event analytics integration will be enabled in the final deployment sprint.
            This section is reserved for KPI cards, channel attribution, and repeat customer trends.
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </>
  )
}
