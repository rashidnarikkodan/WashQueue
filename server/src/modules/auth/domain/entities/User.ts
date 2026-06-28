import { ROLE } from "@/shared/constants/role.constants"
import { AuthProvider } from "@/shared/constants/authProvider"

interface UserProps {
    id:string,
    name: string
    email: string
    phone: string
    password: string
    role: ROLE
    refreshToken?: string
    lastLoginAt?: Date
    walletBalance?: number
    avatar?: string
    authProvider?: AuthProvider

    isBlocked?: boolean
    isVerified?: boolean

    createdAt?: Date
    updatedAt?: Date
}

export class User implements UserProps {
    readonly id: string
    readonly name: string
    readonly email: string
    readonly phone: string
    readonly password: string
    readonly role: ROLE
    readonly refreshToken?: string
    readonly lastLoginAt?: Date
    readonly walletBalance?: number
    readonly avatar?: string
    readonly authProvider?: AuthProvider
    readonly isBlocked?: boolean
    readonly isVerified?: boolean
    readonly createdAt?: Date                        
    readonly updatedAt?: Date

    constructor(props: UserProps) {
        this.id = props.id
        this.name = props.name
        this.email = props.email
        this.phone = props.phone
        this.password = props.password
        this.role = props.role
        this.refreshToken = props.refreshToken
        this.lastLoginAt = props.lastLoginAt
        this.walletBalance = props.walletBalance
        this.avatar = props.avatar
        this.authProvider = props.authProvider
        this.isBlocked = props.isBlocked
        this.isVerified = props.isVerified
        this.createdAt = props.createdAt
        this.updatedAt = props.updatedAt
    }
}