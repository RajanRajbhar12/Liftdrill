"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { PlusCircle, CreditCard, Trash2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { ConfirmModal } from "@/components/confirm-modal"

interface PaymentMethod {
  id: string
  type: string
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

// Simulate fetching existing payment methods
const simulatedPaymentMethods: PaymentMethod[] = [
  { id: "card_1", last4: "4242", brand: "Visa", expiryMonth: 12, expiryYear: 25, isDefault: true, type: "credit" },
  { id: "card_2", last4: "1111", brand: "Mastercard", expiryMonth: 1, expiryYear: 27, isDefault: false, type: "credit" },
]

export default function PaymentMethodsPage() {
  const [loading, setLoading] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(simulatedPaymentMethods)
  const [addingCard, setAddingCard] = useState(false)
  const [newCardDetails, setNewCardDetails] = useState({
    cardNumber: "",
    expiryDate: "", // MM/YY
    cvc: "",
    cardholderName: "",
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewCardDetails({ ...newCardDetails, [id]: value })
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingCard(true)

    // Simulate API call to add card (replace with actual Stripe/payment gateway integration)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Basic validation and parsing expiry date
    const expiryMatch = newCardDetails.expiryDate.match(/^(\d{2})\/(\d{2})$/)
    if (!newCardDetails.cardNumber || !expiryMatch || !newCardDetails.cvc || !newCardDetails.cardholderName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required card details correctly.",
        variant: "destructive",
      })
      setAddingCard(false)
      return
    }

    const expiryMonth = parseInt(expiryMatch[1], 10)
    const expiryYear = parseInt(expiryMatch[2], 10)

    // Basic expiry date check (simple year/month comparison)
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1 // getMonth() is 0-indexed

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      toast({
        title: "Validation Error",
        description: "Expiry date is in the past.",
        variant: "destructive",
      })
      setAddingCard(false)
      return
    }

    // Simulate successful addition
    const newCard: PaymentMethod = {
      id: `card_${Date.now()}`, // Generate a unique ID
      last4: newCardDetails.cardNumber.slice(-4),
      brand: "Visa", // Simulate brand detection (replace with logic)
      expiryMonth: expiryMonth,
      expiryYear: expiryYear,
      isDefault: paymentMethods.length === 0, // Make the first added card default
      type: "credit", // Default type for simulation
    }

    setPaymentMethods([...paymentMethods, newCard])
    setNewCardDetails({ cardNumber: "", expiryDate: "", cvc: "", cardholderName: "" })
    toast({
      title: "Card Added",
      description: "Your new payment method has been added.",
    })
    setAddingCard(false)
  }

  const confirmDeleteCard = (cardId: string) => {
    setCardToDelete(cardId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCard = async () => {
    if (!cardToDelete) return

    setIsDeleting(true)
    // Simulate API call to delete card (replace with actual integration)
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentMethods(paymentMethods.filter(card => card.id !== cardToDelete))
    toast({
      title: "Card Removed",
      description: "The payment method has been successfully removed.",
    })
    setIsDeleting(false)
    setIsDeleteModalOpen(false)
    setCardToDelete(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your saved credit and debit cards.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Existing Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-500">No payment methods saved.</p>
                ) : (
                  paymentMethods.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 border rounded-xl shadow-sm bg-blue-50"
                    >
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-6 w-6 text-blue-800" />
                        <div>
                          <p className="font-medium text-gray-800">{card.brand} ending in {card.last4}</p>
                          <p className="text-sm text-gray-600">Expires {card.expiryMonth.toString().padStart(2, "0")}/{card.expiryYear}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => confirmDeleteCard(card.id)} disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Add New Payment Method Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Add New Card</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={newCardDetails.cardholderName}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      value={newCardDetails.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19} // Standard card number length + spaces
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={newCardDetails.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        type="text"
                        value={newCardDetails.cvc}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl"
                        placeholder="CVC"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-700 text-white rounded-xl" disabled={addingCard}>
                    {addingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Add Card
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteCard}
          title="Confirm Card Deletion"
          description="Are you sure you want to remove this payment method?"
          confirmText="Remove Card"
          cancelText="Cancel"
          isConfirming={isDeleting}
        />
      </div>
    </div>
  )
} 