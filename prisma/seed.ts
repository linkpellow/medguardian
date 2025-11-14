import { PrismaClient, QuestionType, QuestionCategory, USState, AgentStatus, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data (optional - for development)
  console.log("🧹 Cleaning existing data...")
  await prisma.routingLog.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.customQuestion.deleteMany()
  await prisma.agentQuestionSetting.deleteMany()
  await prisma.question.deleteMany()
  await prisma.agentProfile.deleteMany()
  await prisma.agentLicense.deleteMany()
  await prisma.agent.deleteMany()

  // Hash password for agents
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create 3 Agents
  console.log("👤 Creating agents...")
  const agent1 = await prisma.agent.create({
    data: {
      email: "john.smith@insurance.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Smith",
      status: AgentStatus.ACTIVE,
      role: UserRole.AGENT,
      licenses: {
        create: [
          {
            state: USState.CA,
            licenseNumber: "CA-12345",
            verified: true,
            expirationDate: new Date("2025-12-31"),
          },
          {
            state: USState.NV,
            licenseNumber: "NV-67890",
            verified: true,
            expirationDate: new Date("2025-12-31"),
          },
        ],
      },
      profile: {
        create: {
          photo: "/agents/john-smith.jpg",
          bio: "Licensed insurance agent with over 10 years of experience helping families find the right coverage.",
          title: "Senior Insurance Advisor",
          phone: "+1-555-0101",
          email: "john.smith@insurance.com",
          website: "https://johnsmithinsurance.com",
          socialLinks: {
            linkedin: "https://linkedin.com/in/johnsmith",
            facebook: "https://facebook.com/johnsmithinsurance",
          },
          primaryColor: "#1e40af",
          secondaryColor: "#3b82f6",
          accentColor: "#60a5fa",
          theme: "professional",
          layoutTemplate: "modern",
          testimonials: [
            {
              name: "Sarah Johnson",
              text: "John helped us find the perfect family plan. Excellent service!",
              rating: 5,
            },
            {
              name: "Michael Chen",
              text: "Very knowledgeable and responsive. Highly recommend!",
              rating: 5,
            },
          ],
          badges: [
            { name: "Certified Insurance Advisor", image: "/badges/cia.png" },
            { name: "Top Producer 2023", image: "/badges/top-producer.png" },
          ],
          credentials: [
            { name: "Life Insurance License", issuer: "California Department of Insurance", year: 2014 },
            { name: "Health Insurance License", issuer: "California Department of Insurance", year: 2014 },
          ],
          calendlyUrl: "https://calendly.com/johnsmith",
          thankYouMessage: "Thank you for your interest! I'll contact you within 24 hours to discuss your insurance needs.",
        },
      },
    },
  })

  const agent2 = await prisma.agent.create({
    data: {
      email: "maria.garcia@insurance.com",
      password: hashedPassword,
      firstName: "Maria",
      lastName: "Garcia",
      status: AgentStatus.ACTIVE,
      role: UserRole.AGENT,
      licenses: {
        create: [
          {
            state: USState.TX,
            licenseNumber: "TX-54321",
            verified: true,
            expirationDate: new Date("2025-12-31"),
          },
          {
            state: USState.FL,
            licenseNumber: "FL-98765",
            verified: true,
            expirationDate: new Date("2025-12-31"),
          },
        ],
      },
      profile: {
        create: {
          photo: "/agents/maria-garcia.jpg",
          bio: "Bilingual insurance professional specializing in health and life insurance for individuals and families.",
          title: "Insurance Specialist",
          phone: "+1-555-0102",
          email: "maria.garcia@insurance.com",
          website: "https://mariagarciainsurance.com",
          socialLinks: {
            linkedin: "https://linkedin.com/in/mariagarcia",
            instagram: "https://instagram.com/mariagarciainsurance",
          },
          primaryColor: "#7c3aed",
          secondaryColor: "#a78bfa",
          accentColor: "#c4b5fd",
          theme: "friendly",
          layoutTemplate: "classic",
          testimonials: [
            {
              name: "Roberto Martinez",
              text: "Maria made the whole process easy and explained everything clearly.",
              rating: 5,
            },
            {
              name: "Jennifer Lee",
              text: "Best insurance agent I've worked with. Very professional!",
              rating: 5,
            },
          ],
          badges: [
            { name: "Bilingual Certified", image: "/badges/bilingual.png" },
            { name: "Customer Service Excellence", image: "/badges/customer-service.png" },
          ],
          credentials: [
            { name: "Health Insurance License", issuer: "Texas Department of Insurance", year: 2018 },
            { name: "Life Insurance License", issuer: "Texas Department of Insurance", year: 2018 },
          ],
          googleCalendarUrl: "https://calendar.google.com/calendar/u/0/appointments/schedules",
          thankYouMessage: "¡Gracias por su interés! Me pondré en contacto con usted dentro de 24 horas.",
        },
      },
    },
  })

  const agent3 = await prisma.agent.create({
    data: {
      email: "david.jones@insurance.com",
      password: hashedPassword,
      firstName: "David",
      lastName: "Jones",
      status: AgentStatus.ACTIVE,
      role: UserRole.AGENT,
      licenses: {
        create: [
          {
            state: USState.NY,
            licenseNumber: "NY-11111",
            verified: true,
            expirationDate: new Date("2025-12-31"),
          },
          {
            state: USState.NJ,
            licenseNumber: "NJ-22222",
            verified: true,
            expirationDate: new Date("2025-12-31"),
          },
        ],
      },
      profile: {
        create: {
          photo: "/agents/david-jones.jpg",
          bio: "Experienced insurance advisor focused on helping small businesses and individuals navigate their coverage options.",
          title: "Insurance Consultant",
          phone: "+1-555-0103",
          email: "david.jones@insurance.com",
          website: "https://davidjonesinsurance.com",
          socialLinks: {
            linkedin: "https://linkedin.com/in/davidjones",
            twitter: "https://twitter.com/davidjonesins",
          },
          primaryColor: "#059669",
          secondaryColor: "#10b981",
          accentColor: "#34d399",
          theme: "corporate",
          layoutTemplate: "minimal",
          testimonials: [
            {
              name: "Amanda Williams",
              text: "David helped our small business find affordable group coverage. Great experience!",
              rating: 5,
            },
            {
              name: "Robert Taylor",
              text: "Professional, knowledgeable, and always available when needed.",
              rating: 5,
            },
          ],
          badges: [
            { name: "Small Business Specialist", image: "/badges/small-business.png" },
            { name: "Group Insurance Expert", image: "/badges/group-insurance.png" },
          ],
          credentials: [
            { name: "Property & Casualty License", issuer: "New York Department of Financial Services", year: 2016 },
            { name: "Health Insurance License", issuer: "New York Department of Financial Services", year: 2016 },
          ],
          customCalendarUrl: "https://davidjonesinsurance.com/book",
          thankYouMessage: "Thank you for reaching out! I'll be in touch soon to discuss your insurance needs.",
        },
      },
    },
  })

  console.log("✅ Created 3 agents")

  // Create Core Questions (Locked)
  console.log("📝 Creating core questions...")
  const coreQuestions = [
    {
      key: "first_name",
      label: "First Name",
      type: QuestionType.SHORT_TEXT,
      category: QuestionCategory.CORE,
      required: true,
      order: 1,
      placeholder: "Enter your first name",
    },
    {
      key: "last_name",
      label: "Last Name",
      type: QuestionType.SHORT_TEXT,
      category: QuestionCategory.CORE,
      required: true,
      order: 2,
      placeholder: "Enter your last name",
    },
    {
      key: "phone",
      label: "Phone Number",
      type: QuestionType.PHONE,
      category: QuestionCategory.CORE,
      required: true,
      order: 3,
      placeholder: "(555) 123-4567",
      validation: {
        pattern: "^[\\d\\s\\-\\(\\)]+$",
        minLength: 10,
      },
    },
    {
      key: "email",
      label: "Email Address",
      type: QuestionType.EMAIL,
      category: QuestionCategory.CORE,
      required: true,
      order: 4,
      placeholder: "your.email@example.com",
    },
    {
      key: "zip",
      label: "ZIP Code",
      type: QuestionType.SHORT_TEXT,
      category: QuestionCategory.CORE,
      required: true,
      order: 5,
      placeholder: "12345",
      validation: {
        pattern: "^\\d{5}(-\\d{4})?$",
      },
    },
    {
      key: "state",
      label: "State",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.CORE,
      required: true,
      order: 6,
      options: Object.values(USState).map((state) => ({
        value: state,
        label: state,
      })),
    },
    {
      key: "dob",
      label: "Date of Birth",
      type: QuestionType.DATE,
      category: QuestionCategory.CORE,
      required: true,
      order: 7,
      validation: {
        max: new Date().toISOString().split("T")[0], // Cannot be in the future
      },
    },
    {
      key: "tobacco_use",
      label: "Do you currently use tobacco products?",
      type: QuestionType.YES_NO,
      category: QuestionCategory.CORE,
      required: true,
      order: 8,
      helpText: "This includes cigarettes, cigars, chewing tobacco, and vaping products",
    },
    {
      key: "coverage_start_preference",
      label: "When would you like coverage to start?",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.CORE,
      required: true,
      order: 9,
      options: [
        { value: "immediately", label: "Immediately" },
        { value: "next_month", label: "Next Month" },
        { value: "specific_date", label: "Specific Date" },
        { value: "not_sure", label: "Not Sure" },
      ],
    },
    {
      key: "people_needing_coverage",
      label: "How many people need coverage?",
      type: QuestionType.NUMBER,
      category: QuestionCategory.CORE,
      required: true,
      order: 10,
      validation: {
        min: 1,
        max: 20,
      },
      helpText: "Include yourself and all dependents",
    },
  ]

  for (const q of coreQuestions) {
    await prisma.question.create({ data: q })
  }

  console.log(`✅ Created ${coreQuestions.length} core questions`)

  // Create Optional Questions (Editable)
  console.log("📋 Creating optional questions...")
  const optionalQuestions = [
    {
      key: "gender",
      label: "Gender",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 1,
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "non_binary", label: "Non-binary" },
        { value: "prefer_not_to_say", label: "Prefer not to say" },
      ],
    },
    {
      key: "household_income",
      label: "Household Income",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 2,
      options: [
        { value: "under_25k", label: "Under $25,000" },
        { value: "25k_50k", label: "$25,000 - $50,000" },
        { value: "50k_75k", label: "$50,000 - $75,000" },
        { value: "75k_100k", label: "$75,000 - $100,000" },
        { value: "100k_150k", label: "$100,000 - $150,000" },
        { value: "over_150k", label: "Over $150,000" },
        { value: "prefer_not_to_say", label: "Prefer not to say" },
      ],
    },
    {
      key: "current_coverage",
      label: "Do you currently have health insurance?",
      type: QuestionType.YES_NO,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 3,
      helpText: "This helps us understand your current situation",
    },
    {
      key: "deductible_preference",
      label: "What deductible range are you comfortable with?",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 4,
      options: [
        { value: "low", label: "Low ($500 - $1,000)" },
        { value: "medium", label: "Medium ($1,000 - $3,000)" },
        { value: "high", label: "High ($3,000+)" },
        { value: "not_sure", label: "Not Sure" },
      ],
    },
    {
      key: "carrier_preference",
      label: "Do you have a preferred insurance carrier?",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 5,
      options: [
        { value: "blue_cross", label: "Blue Cross Blue Shield" },
        { value: "aetna", label: "Aetna" },
        { value: "united_healthcare", label: "UnitedHealthcare" },
        { value: "cigna", label: "Cigna" },
        { value: "humana", label: "Humana" },
        { value: "no_preference", label: "No Preference" },
        { value: "not_sure", label: "Not Sure" },
      ],
    },
    {
      key: "dental_vision_preference",
      label: "Are you interested in dental and vision coverage?",
      type: QuestionType.YES_NO,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 6,
    },
    {
      key: "medications",
      label: "Are you currently taking any prescription medications?",
      type: QuestionType.YES_NO,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 7,
      helpText: "This helps us find plans that cover your medications",
    },
    {
      key: "employment_status",
      label: "Employment Status",
      type: QuestionType.MULTIPLE_CHOICE,
      category: QuestionCategory.OPTIONAL,
      required: false,
      order: 8,
      options: [
        { value: "employed_full_time", label: "Employed Full-Time" },
        { value: "employed_part_time", label: "Employed Part-Time" },
        { value: "self_employed", label: "Self-Employed" },
        { value: "unemployed", label: "Unemployed" },
        { value: "retired", label: "Retired" },
        { value: "student", label: "Student" },
      ],
    },
  ]

  for (const q of optionalQuestions) {
    await prisma.question.create({ data: q })
  }

  console.log(`✅ Created ${optionalQuestions.length} optional questions`)

  // Create Custom Questions for Agent 1
  console.log("✏️ Creating custom questions for agents...")
  await prisma.customQuestion.createMany({
    data: [
      {
        agentId: agent1.id,
        key: "preferred_contact_time",
        label: "What time of day do you prefer to be contacted?",
        type: QuestionType.MULTIPLE_CHOICE,
        required: false,
        order: 1,
        options: [
          { value: "morning", label: "Morning (9 AM - 12 PM)" },
          { value: "afternoon", label: "Afternoon (12 PM - 5 PM)" },
          { value: "evening", label: "Evening (5 PM - 8 PM)" },
          { value: "anytime", label: "Anytime" },
        ],
      },
      {
        agentId: agent1.id,
        key: "previous_insurance_experience",
        label: "Have you had health insurance before?",
        type: QuestionType.YES_NO,
        required: false,
        order: 2,
        helpText: "This helps me understand your experience with insurance",
      },
    ],
  })

  // Create Custom Questions for Agent 2
  await prisma.customQuestion.createMany({
    data: [
      {
        agentId: agent2.id,
        key: "language_preference",
        label: "What language would you prefer for communication?",
        type: QuestionType.MULTIPLE_CHOICE,
        required: false,
        order: 1,
        options: [
          { value: "english", label: "English" },
          { value: "spanish", label: "Spanish" },
          { value: "both", label: "Both" },
        ],
      },
      {
        agentId: agent2.id,
        key: "family_size",
        label: "How many people are in your household?",
        type: QuestionType.NUMBER,
        required: false,
        order: 2,
        validation: {
          min: 1,
          max: 15,
        },
      },
    ],
  })

  // Create Custom Questions for Agent 3
  await prisma.customQuestion.createMany({
    data: [
      {
        agentId: agent3.id,
        key: "business_type",
        label: "What type of business do you own? (if applicable)",
        type: QuestionType.SHORT_TEXT,
        required: false,
        order: 1,
        placeholder: "e.g., Restaurant, Retail, Consulting",
      },
      {
        agentId: agent3.id,
        key: "employees_count",
        label: "How many employees does your business have?",
        type: QuestionType.NUMBER,
        required: false,
        order: 2,
        validation: {
          min: 1,
          max: 500,
        },
        helpText: "This helps us find the right group plan",
      },
    ],
  })

  console.log("✅ Created 2 custom questions for each agent")

  // Create Admin User
  console.log("👑 Creating admin user...")
  const admin = await prisma.agent.create({
    data: {
      email: "admin@meduardian.net",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      status: AgentStatus.ACTIVE,
      role: UserRole.ADMIN,
    },
  })
  console.log("✅ Created admin user")

  console.log("🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

