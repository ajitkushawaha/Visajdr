"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  X, 
  GripVertical, 
  ChevronDown,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react"

interface MenuItem {
  _id?: string
  label: string
  href: string
  icon?: string
  target: '_self' | '_blank'
  hasDropdown: boolean
  dropdownItems: MenuItem[]
  order: number
  status: 'active' | 'inactive'
}

interface DraggableNavigationProps {
  items: MenuItem[]
  onItemsChange: (items: MenuItem[]) => void
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, field: keyof MenuItem, value: any) => void
}

export function DraggableNavigation({
  items,
  onItemsChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem
}: DraggableNavigationProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    
    // Remove the dragged item
    newItems.splice(draggedIndex, 1)
    
    // Insert at new position
    newItems.splice(dropIndex, 0, draggedItem)
    
    // Update order numbers
    newItems.forEach((item, index) => {
      item.order = index + 1
    })
    
    onItemsChange(newItems)
    setDraggedIndex(null)
  }

  const addDropdownItem = (parentIndex: number) => {
    const newDropdownItem: MenuItem = {
      label: "",
      href: "",
      icon: "",
      target: "_self",
      hasDropdown: false,
      dropdownItems: [],
      order: items[parentIndex].dropdownItems.length + 1,
      status: "active"
    }
    
    const updatedItems = [...items]
    updatedItems[parentIndex].dropdownItems.push(newDropdownItem)
    onItemsChange(updatedItems)
  }

  const updateDropdownItem = (parentIndex: number, childIndex: number, field: keyof MenuItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[parentIndex].dropdownItems[childIndex] = { 
      ...updatedItems[parentIndex].dropdownItems[childIndex], 
      [field]: value 
    }
    onItemsChange(updatedItems)
  }

  const removeDropdownItem = (parentIndex: number, childIndex: number) => {
    const updatedItems = [...items]
    updatedItems[parentIndex].dropdownItems = updatedItems[parentIndex].dropdownItems.filter((_, i) => i !== childIndex)
    onItemsChange(updatedItems)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className={`border rounded-lg p-4 bg-white ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <Badge variant="outline">#{item.order}</Badge>
              <span className="text-sm font-medium">Menu Item {index + 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`label-${index}`}>Label *</Label>
              <Input
                id={`label-${index}`}
                value={item.label}
                onChange={(e) => onUpdateItem(index, 'label', e.target.value)}
                placeholder="Menu Item Label"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`href-${index}`}>URL *</Label>
              <Input
                id={`href-${index}`}
                value={item.href}
                onChange={(e) => onUpdateItem(index, 'href', e.target.value)}
                placeholder="/page-url"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`icon-${index}`}>Icon</Label>
              <Input
                id={`icon-${index}`}
                value={item.icon || ''}
                onChange={(e) => onUpdateItem(index, 'icon', e.target.value)}
                placeholder="🏠 or icon name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`target-${index}`}>Target</Label>
              <Select
                value={item.target}
                onValueChange={(value: '_self' | '_blank') => onUpdateItem(index, 'target', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same Window</SelectItem>
                  <SelectItem value="_blank">New Window</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`status-${index}`}>Status</Label>
              <Select
                value={item.status}
                onValueChange={(value: 'active' | 'inactive') => onUpdateItem(index, 'status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateItem(index, 'hasDropdown', !item.hasDropdown)}
                className="w-full"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                {item.hasDropdown ? 'Remove Dropdown' : 'Add Dropdown'}
              </Button>
            </div>
          </div>

          {/* Dropdown Items */}
          {item.hasDropdown && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Dropdown Items</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addDropdownItem(index)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {item.dropdownItems.map((dropdownItem, childIndex) => (
                  <div key={childIndex} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Dropdown Item {childIndex + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDropdownItem(index, childIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`dropdown-label-${index}-${childIndex}`}>Label</Label>
                        <Input
                          id={`dropdown-label-${index}-${childIndex}`}
                          value={dropdownItem.label}
                          onChange={(e) => updateDropdownItem(index, childIndex, 'label', e.target.value)}
                          placeholder="Dropdown Label"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`dropdown-href-${index}-${childIndex}`}>URL</Label>
                        <Input
                          id={`dropdown-href-${index}-${childIndex}`}
                          value={dropdownItem.href}
                          onChange={(e) => updateDropdownItem(index, childIndex, 'href', e.target.value)}
                          placeholder="/dropdown-url"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`dropdown-target-${index}-${childIndex}`}>Target</Label>
                        <Select
                          value={dropdownItem.target}
                          onValueChange={(value: '_self' | '_blank') => updateDropdownItem(index, childIndex, 'target', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_self">Same Window</SelectItem>
                            <SelectItem value="_blank">New Window</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`dropdown-status-${index}-${childIndex}`}>Status</Label>
                        <Select
                          value={dropdownItem.status}
                          onValueChange={(value: 'active' | 'inactive') => updateDropdownItem(index, childIndex, 'status', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {item.dropdownItems.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No dropdown items yet. Click "Add Item" to create one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No menu items yet</p>
          <p className="text-sm">Click "Add Menu Item" to get started</p>
        </div>
      )}

      <Button
        variant="outline"
        onClick={onAddItem}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Menu Item
      </Button>
    </div>
  )
}
