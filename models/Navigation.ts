import mongoose, { Schema, Document } from 'mongoose'

interface INavigationItem {
  label: string
  href: string
  icon?: string
  order?: number
  isActive?: boolean
  target?: '_self' | '_blank'
  hasDropdown?: boolean
  dropdownItems?: INavigationItem[]
  children?: INavigationItem[]
  status?: 'active' | 'inactive'
  _id?: string
}

interface INavigation extends Document {
  name: string
  type:
    | 'main'
    | 'footer'
    | 'footer-useful'
    | 'footer-agent'
    | 'mobile'
    | 'sidebar'
  items: INavigationItem[]
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const NavigationItemSchema = new Schema<INavigationItem>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    href: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'filetext',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self',
    },
    hasDropdown: {
      type: Boolean,
      default: false,
    },
    dropdownItems: [
      {
        type: Schema.Types.Mixed,
        default: [],
      },
    ],
    children: [
      {
        type: Schema.Types.Mixed,
        default: [],
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { _id: true }
)

const NavigationSchema = new Schema<INavigation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'main',
        'footer',
        'footer-useful',
        'footer-agent',
        'mobile',
        'sidebar',
      ],
    },
    items: [NavigationItemSchema],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for better performance
NavigationSchema.index({ type: 1, status: 1 })

const Navigation =
  mongoose.models.Navigation ||
  mongoose.model<INavigation>('Navigation', NavigationSchema)

export default Navigation
export type { INavigation, INavigationItem }
