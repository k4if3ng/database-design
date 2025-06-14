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
  baseSalary: number
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
  id: number
  issue: string
  status: string
  vehicleId: number
  licensePlate: string
  workerId?: number
  workerName?: string
  createTime: string
  assignTime?: string
  estimatedCompletionTime?: string
  repairType?: string
  repairSolution?: string
  repairResult?: string
  feedbackId?: number
  hasFeedback?: boolean
  // worker
  vehicleInfo?: Partial<Vehicle>
  customerPhone?: string
}

export interface RepairLog {
  id: number
  orderId: number
  vehicleId: number
  licensePlate: string
  issue: string
  repairDescription: string
  materialsCost: number
  laborCost: number
  totalCost: number
  total: number
  workerName: string
  submitTime: string
  completionTime: string
  // worker
  vehicleInfo?: Partial<Vehicle>
  laborHours?: number
  completeTime?: string
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
  unitPrice: number
  totalCost: number
  supplier: string
}

export interface Feedback {
  id: number
  OrderId: number
  rating: number
  content: string
  category: string
  submitTime: string
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

export interface ProcessOrderRes {
  id: number
  status: string
  acceptTime?: string
  rejectTime?: string
  completeTime?: string
  laborHours?: number
  laborCost?: number
  totalCost?: number
}

export interface Earning {
  totalEarnings: number
  thisMonthEarnings: number
  completedOrders: number
  averageOrderValue: number
}

export interface Performance {
  completionRate: number
  averageRating: number
  totalWorkHours: number
  OnTimeCompletionRate: number
}
