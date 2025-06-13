export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface ErrorResponse {
  status: number
  message: string
  details?: string[]
  errorId?: string
}

export interface User {
  id: number
  username: string
  phone: string
}

export interface Worker {
  id: number
  workerName: string
  specialty: string
  hourlyWage: number
  totalEarnings: number
}

export interface Vehicle {
  vehicleId: number
  licensePlate: string
  brand: string
  model: string
  year: number
  vin: string
}

export interface RepairOrder {
  orderId: number
  issue: string
  status: string
  createTime: string
  vehicleId: number
  licensePlate: string
  materials?: Material[]
  workerId?: number
  workerName?: string
  specialty?: string
  assignTime?: string
  acceptTime?: string
  completeTime?: string
  laborCost?: number
  materialCost?: number
  totalCost?: number
  cannotReject?: boolean
  repairType?: string
  repairSolution?: string
  diagnosis?: string
  estimatedCompletionTime?: string
  repairResult?: string
  feedbackId?: number
  hasFeedback?: boolean
}

export interface RepairLog {
  logId: number
  issue: string
  repairResult: string
  submitTime: string
  completionTime: string
  rating: number
  totalCost: number
  vehicleId: number
  licensePlate: string
  vehicleBrand: string
  vehicleModel: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirmedPassword: string
  phone: string
}

export interface LoginResponse {
  token: string
  id: number
  username: string
  role: string
}

export interface Material {
  id: number
  orderId: number
  name: string
  quantity: number
  price: number
  totalCost: number
}

export interface Feedback {
  id: number
  repairOrderId: number
  rating: number
  content: string
  submitTime: string
  orderId: number
  issue: string
  status: string
  createTime: string
  vehicleId: number
  licensePlate: string
}

export interface SubmitRepairRequest {
  vehicleId: number
  issue: string
  repairType: string
  additionalInfo?: string
}

export interface SystemStats {
  totalRevenue: number
  totalLaborCost: number
  totalMaterialCost: number
  netIncome: number
  totalRepairOrders: number
  completedRepairOrders: number
  averageCustomerRating: number
}
