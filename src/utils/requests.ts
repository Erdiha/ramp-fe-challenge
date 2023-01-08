import {
  PaginatedRequestParams,
  PaginatedResponse,
  RequestByEmployeeParams,
  SetTransactionApprovalParams,
  Transaction,
  Employee,
} from "./types"
import mockData from "../mock-data.json"


const TRANSACTIONS_PER_PAGE = 5

const data: { employees: Employee[]; transactions: Transaction[] } = {
  employees: mockData.employees,
  transactions: mockData.transactions,
}
//console.log("total transactions", data.transactions.length)
export const getEmployees = (): Employee[] => data.employees

export const getTransactionsPaginated = ({
  page,
}: PaginatedRequestParams): PaginatedResponse<Transaction[]> => {
  if (page === null) {
    page = 0
    throw new Error("Page cannot be null")
  }
  const start = page * TRANSACTIONS_PER_PAGE
  const end = start + TRANSACTIONS_PER_PAGE
  const nextPage: number | null = end < data.transactions.length ? page + 1 : null

  if (end > data.transactions.length) {
    return {
      nextPage: null,
      data: data.transactions.slice(start),
    }
  }

  return {
    nextPage,
    data: data.transactions.slice(start, end),
  }
}

export const getTransactionsByEmployee = ({ employeeId }: RequestByEmployeeParams) => {
  if (!employeeId) {
    return data.transactions
  }
  if (employeeId === null) {
    throw new Error("Employee id cannot be empty")
  }
  return data.transactions.filter((transaction) => transaction.employee.id === employeeId)
}

export const setTransactionApproval = ({ transactionId, value }: SetTransactionApprovalParams): void => {
  const transaction = data.transactions.find(
    (currentTransaction) => currentTransaction.id === transactionId
  )

  if (!transaction) {
    throw new Error(`Invalid transaction to approve:${transactionId}`)
  }

  transaction.approved = value
}
