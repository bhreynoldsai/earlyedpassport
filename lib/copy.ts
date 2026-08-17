/**
 * ALL user-facing strings live here. Ticket T-0.9.
 *
 * Enforced by `pnpm lint:copy` (scripts/check-copy-registry.mjs), which fails
 * on user-facing string literals in JSX and on banned vocabulary anywhere in
 * this file.
 *
 * RULES (BUILD-INSTRUCTIONS §7.2):
 *  - 6th-grade reading level. If it scores above grade 6, rewrite it.
 *  - Banned in the UI: CRM, entity, record (as a noun for the object),
 *    attribute, taxonomy, sync, validate, invalid, submit, configure,
 *    parameter, metadata.
 *  - Say instead: child, page, list, thing, save, "we'll add it when you're
 *    back online", "you still need…", "add", "set up".
 *  - Buttons are verbs a person would say out loud.
 */

export const copy = {
  product: {
    name: 'Early Ed Passport',
    tagline: 'Weekly lesson plans with your five learning areas already tagged.',
  },

  /** Required by spec. App footer AND every printed lesson plan. */
  standards: {
    attribution: 'Developmental focus areas and activities are original to Early Ed Passport.',
    /** Not tied to a single state's published standards — our own framework. */
    notEndorsed: 'This is our own framework, built from real classroom activities.',
  },

  /** Required by spec. Top of the child Learning tab AND the passport footnote. */
  learning: {
    notAnAssessment:
      'These are notes about what teachers have seen. This is not a test or a screening.',
    title: 'Learning',
    noneYet: 'No notes yet. Add the first one when you see something worth keeping.',
    addNote: 'Save this note',
  },

  /** The one quiet status chip. Never the word "sync". Never an error. */
  save: {
    saved: 'Saved',
    saving: 'Saving…',
    savedOnPhone: 'Saved on this phone — will send when you are back online',
    secondCopy: 'We saved a second copy of this note. Tap to compare.',
  },

  planner: {
    title: 'Plans',
    planNextWeek: 'Plan next week',
    changeTheme: 'Change the theme?',
    theme: 'Theme',
    printPost: 'Print / Post',
    tapToAdd: 'Tap to add',
    weekOf: 'Week of',
    /** Coverage nudges. Amber, plain, never blocking. */
    coverageLine: (covered: number, total: number) =>
      `You have ${covered} of ${total} areas this week.`,
    coverageAll: 'You have all five areas this week.',
    addOne: 'Add one',
    missingDomain: (domain: string) => `You still need something for ${domain}.`,
    emptyWeek: 'Nothing here yet. Start from last week so you are not looking at a blank page.',
    startFromLastWeek: 'Start from last week',
  },

  activity: {
    title: 'Title',
    titleHint: 'Short. Like "Leaf Sorting."',
    whatYouDo: 'What you do',
    whatTheyLearn: 'What they are learning',
    materials: 'Things you need',
    differentiation: 'Different ways in',
    forMoreSupport: 'For a child who needs more help',
    forMoreChallenge: 'For a child who is ready for more',
    iepGoal: 'Goals from a plan',
    timeEstimate: 'How long it takes',
    done: 'Done',
  },

  indicators: {
    title: 'What they are learning',
    tabSuggested: 'Suggested',
    tabByArea: 'By area',
    tabSearch: 'Search',
    suggestedHeader: 'Activities like this usually cover:',
    searchPlaceholderLabel: 'Search for a skill',
    showNearbyAges: 'Show nearby ages',
    tooMany: 'That is a lot for one activity — pick the 2 or 3 you will really watch for.',
    back: 'Back',
    /** The five domains, in plain English a teacher would use out loud. */
    domainPlain: {
      PDM: 'Moving & Growing',
      SED: 'Feelings & Friends',
      APL: 'How They Learn',
      CLL: 'Talking & Reading',
      CD: 'Thinking & Learning',
    },
    /** CD only. Every other domain goes straight to its list. */
    subdomainPlain: {
      MA: 'Math',
      SC: 'Science',
      SS: 'Social Studies',
      CR: 'Creative',
      CP: 'Thinking Skills',
    },
  },

  roster: {
    title: 'My Room',
    hereToday: (n: number) => `${n} here today`,
    observe: '+ Observe',
    thisWeeksPlan: "This week's plan",
    empty: 'No children in this room yet. A director adds them.',
  },

  child: {
    tabBasics: 'Basics',
    tabPeople: 'People',
    tabHealth: 'Health',
    tabLearning: 'Learning',
    tabNotes: 'Notes',
    howToSayIt: 'How to say it',
    photoConsent: 'Family says photos are okay to share',
    allergy: 'Allergy',
    custody: 'Pickup rules — read this first',
    doNotRelease: 'Do not release to',
  },

  compliance: {
    missing: 'Not here yet',
    appointmentCard: 'Appointment card',
    onFile: 'On file',
    expired: 'Out of date',
    /** Form 3300 only: the form is here, but the screening is too old to count. */
    screeningTooOld: 'Screening too old — needs a new one',
    form3231: 'Shot papers (Form 3231)',
    form3300: 'Eye, ear, teeth & food check (Form 3300)',
    screenedOn: 'Checked on',
    dueOn: 'Due by',
    /** Never a block. DECAL prohibits requiring either form to enroll. */
    neverBlocks: 'A child can start and stay without this. We just help you keep track.',
  },

  observe: {
    title: 'What did you see?',
    pickChild: 'Tap a child',
    takePhoto: 'Take a photo',
    skipPhoto: 'Skip the photo',
    saveNote: 'Save this note',
  },

  passport: {
    title: 'Passport',
    fiveThings: 'Five things to know about me',
    whoToCall: 'Who to call',
    signOff: 'Anything the next teacher should know',
    reviewTask: (name: string) => `Look at ${name}'s passport`,
    addTask: (name: string) => `Add anything the next teacher should know about ${name}`,
  },

  director: {
    title: 'Center',
    plansPosted: 'Plans up for next week',
    expiringSoon: 'Papers running out in 30 days',
    observationsThisWeek: 'Notes this week',
    enrollment: 'Children by room',
    staff: 'Teachers',
    print: 'Print',
  },

  /** §7.3 — soft, actionable, never red, never a dialog. */
  states: {
    somethingWentWrong: 'Something went wrong on our end. Your work is saved.',
    tryAgain: 'Try again',
    undone: 'Undone?',
    undo: 'Undo',
    offline: 'You are offline. Keep working — we will send it when you are back.',
    loading: 'One moment…',
  },

  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
    email: 'Email',
    password: 'Password',
    forgot: 'I forgot my password',
    inviteStaff: 'Add a teacher',
    checkEmail: 'Check your email. We sent you a link.',
    /** Deliberately vague. Naming which field was wrong helps a guesser. */
    wrongCredentials: 'That email or password doesn’t match what we have.',
    /** A used or stale invite/reset link, per app/auth/confirm/route.ts. */
    linkExpired: 'That link stopped working. Ask for a new one below.',
    backToSignIn: 'Back to sign in',
    sendResetLink: 'Send the link',
    resetIntro: 'Tell us your email and we’ll send you a link to pick a new password.',
    newPassword: 'New password',
    confirmPassword: 'Type it again',
    passwordHint: 'Use at least 8 characters.',
    savePassword: 'Save password',
    /** Shown once, right after updateUser() succeeds. */
    passwordSaved: 'Your password is set. Taking you in…',
    welcomeSetPassword: 'Welcome. Pick a password to finish setting up your account.',
    pickNewPassword: 'Pick a new password.',
    /** Landing on /invite or /reset-password with no session — an old tab,
     *  a link opened twice, or a bookmark to a page that expects one. */
    noSessionHere: 'That link isn’t good anymore. Ask for a new one.',
    signingIn: 'Signing you in…',
    noCenterYet: 'You’re signed in, but you’re not on a team yet. Ask your director to add you.',
    /** The four staff_role values, in words a director would actually say. */
    roleNames: {
      teacher: 'Teacher',
      lead_teacher: 'Lead teacher',
      director: 'Director',
      org_admin: 'Admin',
    },
  },

  team: {
    title: 'Your team',
    addTeacher: 'Add a teacher',
    fullName: 'Name',
    role: 'Role',
    pickRole: 'Pick a role',
    rooms: 'Rooms',
    noRoomsAssigned: 'No rooms yet',
    sendInvite: 'Send the invite',
    sendingInvite: 'Sending…',
    /** New person: an email actually went out. */
    inviteSent: (email: string) => `We sent an invite to ${email}.`,
    /** Existing person, moving centers or coming back: no email needed. */
    addedToTeam: (email: string) => `${email} is on your team now.`,
    onlyDirectorsCanAdd: 'Only a director can add someone to the team.',
  },

  /** The signed-in home screen. Deliberately plain — Roster and Director
   *  Dashboard are Phase 1/2 tickets; this just proves who is signed in and
   *  what they can reach. */
  home: {
    greeting: (name: string) => `Hi, ${name}.`,
    roleAtCenter: (role: string, center: string) => `${role} at ${center}`,
    yourRooms: 'Your rooms',
    moreThanOneCenter: 'You work at more than one center. This shows the first one for now.',
  },

  /** Screen-reader-only text. Color is never the only signal. */
  a11y: {
    domainCovered: (name: string) => `${name} — you have this one this week`,
    domainNotCovered: (name: string) => `${name} — nothing for this one yet`,
  },

  nav: {
    myRoom: 'My Room',
    plans: 'Plans',
    center: 'Center',
    more: 'More',
  },
} as const

export type Copy = typeof copy
