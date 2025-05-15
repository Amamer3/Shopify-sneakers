import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currentYear = new Date().getFullYear()
const expiryYears = Array.from({ length: 10 }, (_, i) => currentYear + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)

const paymentMethodSchema = z.object({
  type: z.enum(['visa', 'mastercard', 'verve', 'mpesa', 'airtel-money', 'mtn-momo', 'orange-money', 'tigo-pesa', 'vodafone-cash', 'wave']),
  holderName: z.string().min(3, "Name is required"),
  cardNumber: z.string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number must not exceed 19 digits")
    .regex(/^\d+$/, "Card number must contain only digits")
    .optional(),
  expMonth: z.string().min(1, "Expiry month is required").optional(),
  expYear: z.string().min(1, "Expiry year is required").optional(),
  cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "CVV must contain only digits")
    .optional(),
})

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

interface PaymentMethodFormProps {
  onSubmit: (data: PaymentMethodFormData) => void
  onCancel: () => void
  isOpen: boolean
}

export function PaymentMethodForm({ onSubmit, onCancel, isOpen }: PaymentMethodFormProps) {  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: 'visa',
      holderName: '',
      cardNumber: '',
      expMonth: '',
      expYear: '',
      cvv: '',
    },
  })

  const paymentType = form.watch('type')
  const isCardPayment = ['visa', 'mastercard', 'verve'].includes(paymentType)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new card or mobile money payment method to your account
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="visa">Visa Card</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="verve">Verve Card</SelectItem>
                      <SelectItem value="mpesa">M-Pesa (Kenya)</SelectItem>
                      <SelectItem value="airtel-money">Airtel Money (Pan-Africa)</SelectItem>
                      <SelectItem value="mtn-momo">MTN Mobile Money</SelectItem>
                      <SelectItem value="orange-money">Orange Money</SelectItem>
                      <SelectItem value="tigo-pesa">Tigo Pesa</SelectItem>
                      <SelectItem value="vodafone-cash">Vodafone Cash</SelectItem>
                      <SelectItem value="wave">Wave</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />            {/* Show card fields only for card payment types */}
            {['visa', 'mastercard', 'verve'].includes(form.watch('type')) && (
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={19} placeholder="1234 5678 9012 3456" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />            {/* Show expiry date and CVV fields only for card payment types */}
            {['visa', 'mastercard', 'verve'].includes(form.watch('type')) && (
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {month.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expiryYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={4} placeholder="123" type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Add Payment Method</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
