import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Agent from '@/models/Agent'

export async function PATCH(req: Request) {
  try {
    const { userId } = await req.json()

    await connectDB()
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Store previous status
    const previousStatus = user.status.isActive

    // Toggle nested status
    user.status.isActive = !user.status.isActive
    await user.save({ validateBeforeSave: false })

    // If user is an agent, also sync agent status
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ userId: user._id })
      if (agent) {
        const previousAgentStatus = agent.status

        if (user.status.isActive && !previousStatus) {
          // User activated - set agent to approved and isActive to true
          const inactiveStatuses = [
            'pending',
            'inactive',
            'disabled',
            'suspended',
            'rejected',
          ]

          if (inactiveStatuses.includes(agent.status)) {
            // Agent is in inactive state - activate it
            agent.status = 'approved'
            agent.isActive = true
            // Set approved date if not already set
            if (!agent.approvedAt) {
              agent.approvedAt = new Date()
            }
            await agent.save()
          } else if (agent.status === 'approved') {
            // Agent is already approved - just ensure isActive is true
            if (!agent.isActive) {
              agent.isActive = true
              await agent.save()
            } else {
              console.log(
                `Agent status is already approved and active, no change needed`
              )
            }
          } else {
            // Agent has some other status - set to approved and active
            agent.status = 'approved'
            agent.isActive = true
            if (!agent.approvedAt) {
              agent.approvedAt = new Date()
            }
            await agent.save()
            console.log(
              `✅ Changed agent status from ${previousAgentStatus} to approved, isActive: true`
            )
          }
        } else if (!user.status.isActive && previousStatus) {
          // User deactivated - set agent to inactive and isActive to false
          agent.status = 'inactive'
          agent.isActive = false // Also set isActive field
          await agent.save()
          console.log(
            `✅ Deactivated agent account for user: ${user.email}, changed to inactive, isActive: false`
          )
        }

        // Reload agent to get updated status
        await agent.populate('userId')
        console.log(`Final agent status: ${agent.status}`)
      } else {
        console.warn(`Agent record not found for user: ${user.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      isActive: user.status.isActive,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
