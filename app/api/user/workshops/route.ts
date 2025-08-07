import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB  from "@/lib/mongodb"
import Workshop from "@/lib/models/Workshop"
import User from "@/lib/models/User"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const { workshopSelections } = await request.json()
    
    if (!Array.isArray(workshopSelections)) {
      return NextResponse.json(
        { success: false, message: "Invalid workshop selections" },
        { status: 400 }
      )
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Only allow editing if payment is not completed
    if (user.registration.status === 'paid') {
      return NextResponse.json(
        { success: false, message: "Cannot modify workshop selections after payment" },
        { status: 400 }
      )
    }

    // Check workshop availability
    const workshops = await Workshop.find({ id: { $in: workshopSelections } })
    
    for (const workshopId of workshopSelections) {
      const workshop = workshops.find(w => w.id === workshopId)
      if (!workshop) {
        return NextResponse.json(
          { success: false, message: `Workshop with ID "${workshopId}" not found` },
          { status: 404 }
        )
      }
      
      if (workshop.bookedSeats >= workshop.maxSeats) {
        return NextResponse.json(
          { success: false, message: `Workshop "${workshop.name}" is full` },
          { status: 400 }
        )
      }

      // Check if registration is open
      const now = new Date()
      if (now < workshop.registrationStart || now > workshop.registrationEnd) {
        return NextResponse.json(
          { success: false, message: `Registration for "${workshop.name}" is not open` },
          { status: 400 }
        )
      }
    }

    // Update user's workshop selections
    user.registration.workshopSelections = workshopSelections
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Workshop selections updated successfully",
      data: {
        workshopSelections: user.registration.workshopSelections
      }
    })

  } catch (error) {
    console.error("Update workshop selections error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Get workshop details for user's selections
    const workshops = await Workshop.find({ 
      id: { $in: user.registration.workshopSelections },
      isActive: true 
    })

    return NextResponse.json({
      success: true,
      data: {
        workshopSelections: user.registration.workshopSelections,
        workshops: workshops,
        canEdit: user.registration.status !== 'paid'
      }
    })

  } catch (error) {
    console.error("Get workshop selections error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}