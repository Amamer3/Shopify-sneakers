import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().default(false),
})

export type AddressFormData = z.infer<typeof addressSchema>

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void
  onCancel: () => void
  defaultValues?: Partial<AddressFormData>
}

export function AddressForm({ onSubmit, onCancel, defaultValues }: AddressFormProps) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "GH", // Default to Nigeria
      isDefault: false,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>                  <SelectContent>
                    <SelectItem value="DZ">Algeria</SelectItem>
                    <SelectItem value="AO">Angola</SelectItem>
                    <SelectItem value="BJ">Benin</SelectItem>
                    <SelectItem value="BW">Botswana</SelectItem>
                    <SelectItem value="BF">Burkina Faso</SelectItem>
                    <SelectItem value="BI">Burundi</SelectItem>
                    <SelectItem value="CM">Cameroon</SelectItem>
                    <SelectItem value="CV">Cape Verde</SelectItem>
                    <SelectItem value="CF">Central African Republic</SelectItem>
                    <SelectItem value="TD">Chad</SelectItem>
                    <SelectItem value="KM">Comoros</SelectItem>
                    <SelectItem value="CG">Congo</SelectItem>
                    <SelectItem value="CD">DR Congo</SelectItem>
                    <SelectItem value="DJ">Djibouti</SelectItem>
                    <SelectItem value="EG">Egypt</SelectItem>
                    <SelectItem value="GQ">Equatorial Guinea</SelectItem>
                    <SelectItem value="ER">Eritrea</SelectItem>
                    <SelectItem value="ET">Ethiopia</SelectItem>
                    <SelectItem value="GA">Gabon</SelectItem>
                    <SelectItem value="GM">Gambia</SelectItem>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="GN">Guinea</SelectItem>
                    <SelectItem value="GW">Guinea-Bissau</SelectItem>
                    <SelectItem value="CI">Ivory Coast</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="LS">Lesotho</SelectItem>
                    <SelectItem value="LR">Liberia</SelectItem>
                    <SelectItem value="LY">Libya</SelectItem>
                    <SelectItem value="MG">Madagascar</SelectItem>
                    <SelectItem value="MW">Malawi</SelectItem>
                    <SelectItem value="ML">Mali</SelectItem>
                    <SelectItem value="MR">Mauritania</SelectItem>
                    <SelectItem value="MU">Mauritius</SelectItem>
                    <SelectItem value="MA">Morocco</SelectItem>
                    <SelectItem value="MZ">Mozambique</SelectItem>
                    <SelectItem value="NA">Namibia</SelectItem>
                    <SelectItem value="NE">Niger</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="RW">Rwanda</SelectItem>
                    <SelectItem value="ST">São Tomé and Príncipe</SelectItem>
                    <SelectItem value="SN">Senegal</SelectItem>
                    <SelectItem value="SC">Seychelles</SelectItem>
                    <SelectItem value="SL">Sierra Leone</SelectItem>
                    <SelectItem value="SO">Somalia</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                    <SelectItem value="SS">South Sudan</SelectItem>
                    <SelectItem value="SD">Sudan</SelectItem>
                    <SelectItem value="SZ">Eswatini</SelectItem>
                    <SelectItem value="TZ">Tanzania</SelectItem>
                    <SelectItem value="TG">Togo</SelectItem>
                    <SelectItem value="TN">Tunisia</SelectItem>
                    <SelectItem value="UG">Uganda</SelectItem>
                    <SelectItem value="ZM">Zambia</SelectItem>
                    <SelectItem value="ZW">Zimbabwe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Address</Button>
        </div>
      </form>
    </Form>
  )
}
