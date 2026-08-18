/**
 * The Compass — starter content. Ticket: framework replacement.
 *
 * Original developmental content, written from scratch for Early Ed
 * Passport. Not derived from, or checked against, any state standards
 * document. See docs/FRAMEWORK.md for the philosophy and full narrative
 * description of each Pathway.
 *
 * THIS IS A STARTER SET, NOT THE FULL LIBRARY. ~90 skill markers across six
 * Pathways is enough to seed a real database and demo the product end to
 * end, not a finished content library — same honest framing
 * docs/OPEN-ITEMS.md already gives the 300-activity library. Growing this
 * further is a content-writing task, not an engineering one.
 *
 * NEVER hand-edit `full_code` on an existing row after it has shipped to a
 * center — a code that moves out from under an already-attached plan is
 * exactly the bug FULL_CODE_PATTERN's GELDS ancestor existed to prevent.
 * Add new markers with new numbers instead.
 */

import type { AgeBand } from './constants'
import { formatFullCode } from './code'
import type { PathwayCode } from './constants'

export interface MilestoneGroupSeed {
  pathwayCode: PathwayCode
  groupNumber: number
  groupName: string
  groupDescription: string
}

export interface SkillMarkerSeed {
  pathwayCode: PathwayCode
  groupNumber: number
  markerNumber: number
  ageBand: AgeBand
  skillText: string
}

export const MILESTONE_GROUPS: readonly MilestoneGroupSeed[] = [
  // Curious Mind
  {
    pathwayCode: 'CM',
    groupNumber: 1,
    groupName: 'Cause and Effect Detectives',
    groupDescription:
      'How a child notices that actions lead to results — and starts testing that idea on purpose.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 2,
    groupName: 'Sorting, Patterns & Numbers',
    groupDescription:
      'How a child begins to organize the world — by size, color, amount, and repeating patterns.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 3,
    groupName: 'Big Questions',
    groupDescription:
      'How a child moves from noticing something new to wondering about it, asking about it, and working out a solution.',
  },
  // Growing Strong
  {
    pathwayCode: 'GS',
    groupNumber: 1,
    groupName: 'Big Body Moves',
    groupDescription:
      'How a child learns to move through the world — rolling, walking, climbing, running, and jumping.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 2,
    groupName: 'Clever Hands',
    groupDescription:
      'How a child learns to use their fingers and hands with more control — reaching, grasping, stacking, and creating.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 3,
    groupName: 'Taking Care of Me',
    groupDescription:
      'How a child builds everyday habits for feeding, dressing, hygiene, and staying safe.',
  },
  // Finding Words
  {
    pathwayCode: 'FW',
    groupNumber: 1,
    groupName: 'Tuning In',
    groupDescription:
      'How a child listens, pays attention to voices and sounds, and starts to understand what words mean before they can say them back.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 2,
    groupName: 'My Words, My Voice',
    groupDescription:
      'How a child moves from babbling and gestures to real words, sentences, and eventually telling you exactly what is on their mind.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 3,
    groupName: 'Books and Big Ideas',
    groupDescription:
      'How a child discovers that marks on a page carry meaning, and grows a love for stories, pictures, and the written word.',
  },
  // Big Feelings, Good Friends
  {
    pathwayCode: 'BF',
    groupNumber: 1,
    groupName: 'Me, Myself, and I',
    groupDescription:
      'How a child comes to recognize themselves, name their own likes and traits, and feel proud of who they are.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 2,
    groupName: 'Steady and Strong',
    groupDescription:
      'How a child moves from needing a grown-up to calm them down to building their own toolkit for handling big emotions.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 3,
    groupName: 'Friends and Neighbors',
    groupDescription:
      'How a child notices, connects with, and cares about the people around them, from a passing glance to a real friendship.',
  },
  // Trying & Doing
  {
    pathwayCode: 'TD',
    groupNumber: 1,
    groupName: 'Curious Sparks',
    groupDescription:
      'Noticing something interesting and jumping in to explore it, ask about it, or try it out.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 2,
    groupName: 'The Long Haul',
    groupDescription:
      'Staying with something — paying attention, working through the hard part, and coming back to finish.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 3,
    groupName: 'My Own Two Hands',
    groupDescription:
      'Taking care of everyday tasks and choices with growing independence, one small step at a time.',
  },
  // Wonder & Make
  {
    pathwayCode: 'WM',
    groupNumber: 1,
    groupName: 'Marks & Materials',
    groupDescription:
      'How a child explores art tools and hands-on materials, and grows from just touching it to making things on purpose.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 2,
    groupName: 'Pretend Worlds',
    groupDescription:
      'How a child uses imagination to turn ordinary objects, people, and moments into stories and make-believe.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 3,
    groupName: 'Rhythm & Motion',
    groupDescription:
      'How a child discovers sound and movement, and learns to make music and motion that is uniquely their own.',
  },
]

export const SKILL_MARKERS: readonly SkillMarkerSeed[] = [
  // --- Curious Mind ---
  {
    pathwayCode: 'CM',
    groupNumber: 1,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      'Shakes, bangs, or drops an object again and again to see (or hear) what happens each time.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 1,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      "Presses a button, pulls a lever, or turns a knob expecting something to happen, and tries again if it doesn't work the first time.",
  },
  {
    pathwayCode: 'CM',
    groupNumber: 1,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Notices when something looks broken, missing, or different than usual and points it out to a grown-up.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 1,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Makes a simple guess about what will happen before trying it, like "I think it will fall."',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 1,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Explains why something happened using the word "because," even if the explanation is simple.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 2,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      'Watches an object move across a room and reaches or crawls toward where it stopped.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 2,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      'Puts objects into a container and dumps them out, over and over, and fits simple shapes into matching holes.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 2,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Sorts a small group of objects by one feature, like color or size, with a little help.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 2,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Counts a small group of objects out loud while touching each one, up to about five.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 2,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Notices a repeating pattern (like red, blue, red, blue) and can continue it or make one of their own.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 3,
    markerNumber: 1,
    ageBand: 1,
    skillText: 'Looks for a toy after watching it get hidden under a cloth or behind a hand.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 3,
    markerNumber: 2,
    ageBand: 2,
    skillText: 'Points to new or unfamiliar things and asks "what\'s that?"',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 3,
    markerNumber: 3,
    ageBand: 3,
    skillText: 'Asks "why" questions about everyday things, like why the sky is dark at night.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 3,
    markerNumber: 4,
    ageBand: 4,
    skillText:
      'Tries more than one way to solve a small problem before asking a grown-up for help.',
  },
  {
    pathwayCode: 'CM',
    groupNumber: 3,
    markerNumber: 5,
    ageBand: 4,
    skillText: 'Tells a short, simple story that explains how or why something happened.',
  },

  // --- Growing Strong ---
  {
    pathwayCode: 'GS',
    groupNumber: 1,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Pushes up on both arms and lifts their head and chest during tummy time.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 1,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Walks alone across a room without holding on to anything.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 1,
    markerNumber: 3,
    ageBand: 2,
    skillText: 'Runs with control and can stop or turn without falling over.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 1,
    markerNumber: 4,
    ageBand: 3,
    skillText: 'Climbs up and down low play structures, using both hands and feet.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 1,
    markerNumber: 5,
    ageBand: 4,
    skillText: 'Hops on one foot a few times and jumps forward with both feet together.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 2,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Reaches out and grabs a toy with one hand.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 2,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Stacks two or three blocks into a small tower.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 2,
    markerNumber: 3,
    ageBand: 2,
    skillText: 'Turns the pages of a board book one at a time.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 2,
    markerNumber: 4,
    ageBand: 3,
    skillText: 'Snips paper with child-safe scissors.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 2,
    markerNumber: 5,
    ageBand: 4,
    skillText: 'Draws a person with at least three parts, like a head, arms, and legs.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 3,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Opens their mouth for the spoon and swallows soft foods during mealtime.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 3,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Drinks from an open cup held with both hands, even with some spills.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 3,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      "Washes and dries hands with a grown-up's help, before meals and after the bathroom.",
  },
  {
    pathwayCode: 'GS',
    groupNumber: 3,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Puts on simple clothing, like slip-on shoes or an open jacket, with just a little help.',
  },
  {
    pathwayCode: 'GS',
    groupNumber: 3,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Pauses and checks with a grown-up before doing something that seems risky, like climbing very high.',
  },

  // --- Finding Words ---
  {
    pathwayCode: 'FW',
    groupNumber: 1,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Turns toward a familiar voice or a new sound, like keys jingling or a dog barking.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 1,
    markerNumber: 2,
    ageBand: 0,
    skillText:
      "Watches a grown-up's face closely while they talk, especially during songs or peekaboo.",
  },
  {
    pathwayCode: 'FW',
    groupNumber: 1,
    markerNumber: 3,
    ageBand: 1,
    skillText:
      'Points to a body part or a familiar object when someone names it, like "Where\'s your nose?"',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 1,
    markerNumber: 4,
    ageBand: 2,
    skillText: 'Follows a two-step direction, such as "Grab your cup and bring it to the table."',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 1,
    markerNumber: 5,
    ageBand: 3,
    skillText: 'Listens to a short story or explanation and can answer a simple question about it.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 2,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      'Babbles strings of sounds, like "bababa" or "mamama," back and forth with a caregiver.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 2,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Uses a handful of clear words to ask for things, like "milk," "up," or "more."',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 2,
    markerNumber: 3,
    ageBand: 2,
    skillText: 'Puts two or three words together to make a simple idea, like "dog go outside."',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 2,
    markerNumber: 4,
    ageBand: 3,
    skillText: 'Asks "why" and "how" questions about the world, often more than once in a row.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 2,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Tells a short story about something that happened, with a beginning, middle, and end that mostly make sense.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 3,
    markerNumber: 1,
    ageBand: 0,
    skillText: "Reaches for or pats a board book and enjoys being read to on a grown-up's lap.",
  },
  {
    pathwayCode: 'FW',
    groupNumber: 3,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Points to a picture in a book when asked, like "Where\'s the cat?"',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 3,
    markerNumber: 3,
    ageBand: 2,
    skillText: 'Asks to hear a favorite book again and again, and may "read" it aloud from memory.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 3,
    markerNumber: 4,
    ageBand: 3,
    skillText: 'Notices letters in their own name or in signs around the room.',
  },
  {
    pathwayCode: 'FW',
    groupNumber: 3,
    markerNumber: 5,
    ageBand: 4,
    skillText: 'Pretends to write by making letter-like marks or copying a few real letters.',
  },

  // --- Big Feelings, Good Friends ---
  {
    pathwayCode: 'BF',
    groupNumber: 1,
    markerNumber: 1,
    ageBand: 0,
    skillText: "Studies their own hands and feet like they've just discovered something amazing.",
  },
  {
    pathwayCode: 'BF',
    groupNumber: 1,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Turns around when called by name and points to themselves in a photo or mirror.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 1,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Uses "me" or "I" and speaks up about a like or dislike, such as "I like blue" or "no broccoli."',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 1,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Describes themselves in simple terms ("I\'m fast," "I have curly hair") and beams with pride after finishing something.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 1,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      "Talks about something they're good at and something they're still practicing, without it feeling like a big deal.",
  },
  {
    pathwayCode: 'BF',
    groupNumber: 2,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      'Settles down within a few minutes of being picked up, rocked, or spoken to softly by someone they trust.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 2,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      'Reaches for a comfort item, like a blanket or favorite toy, to help get through a hard moment.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 2,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Starts to calm down once a grown-up puts words to the feeling, like "You\'re mad the tower fell."',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 2,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Tries one calm-down move on their own, like a big breath or heading to a cozy spot, sometimes with a gentle reminder.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 2,
    markerNumber: 5,
    ageBand: 4,
    skillText: 'Waits for a turn or a short delay without falling apart, most of the time.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 3,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      'Watches other babies with real interest, reaching toward them or copying their sounds.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 3,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Plays near other children, trading glances, sounds, or the occasional toy.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 3,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Notices when another child is upset and responds, like patting their back or offering a toy.',
  },
  {
    pathwayCode: 'BF',
    groupNumber: 3,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      "Joins another child's game and sticks with simple shared rules for a few minutes at a time.",
  },
  {
    pathwayCode: 'BF',
    groupNumber: 3,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Works out a small disagreement with a friend using words, sometimes with a little coaching from a grown-up nearby.',
  },

  // --- Trying & Doing ---
  {
    pathwayCode: 'TD',
    groupNumber: 1,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Reaches for, mouths, or shakes a new object to figure out what it is.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 1,
    markerNumber: 2,
    ageBand: 1,
    skillText: 'Pokes, presses, or turns things over just to see what happens.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 1,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Asks "what\'s that?" or wanders over to check out something new without being told to.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 1,
    markerNumber: 4,
    ageBand: 3,
    skillText: 'Picks up a new activity on their own and tries it a few different ways.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 1,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Asks "why" or "how" questions to understand something better, and comes up with their own idea for a game or project.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 2,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      "Keeps reaching or scooting toward a toy that's just out of reach instead of giving up right away.",
  },
  {
    pathwayCode: 'TD',
    groupNumber: 2,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      "Tries again after a shape doesn't fit or a tower falls, without needing a grown-up to restart it for them.",
  },
  {
    pathwayCode: 'TD',
    groupNumber: 2,
    markerNumber: 3,
    ageBand: 2,
    skillText: 'Stays with a puzzle, book, or task for a few minutes, even the tricky parts.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 2,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Tries a couple of different ways to solve a problem before asking a grown-up for help.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 2,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Sees a multi-step project through to the end, and has a go-to way of handling frustration — taking a breath, trying a new approach, or asking a friend.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 3,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Holds their own bottle or cup, or feeds themselves a piece of soft food.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 3,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      "Tries to use a spoon or take off their own socks, even if it's messy or takes a while.",
  },
  {
    pathwayCode: 'TD',
    groupNumber: 3,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Washes and dries their hands with a little help, and puts a toy back where it belongs.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 3,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Gets dressed with only a little help, and picks their own activity during choice time.',
  },
  {
    pathwayCode: 'TD',
    groupNumber: 3,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      "Handles a full routine — like getting ready to go outside — on their own, and lends a hand to a friend who's still learning it.",
  },

  // --- Wonder & Make ---
  {
    pathwayCode: 'WM',
    groupNumber: 1,
    markerNumber: 1,
    ageBand: 0,
    skillText:
      'Reaches for, squeezes, or mouths objects with different textures, showing curiosity about how things feel.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 1,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      'Grips a crayon or chalk in a fist and makes marks on paper, just to see what happens.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 1,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      "Points to a scribble or shape and says what it is — even if a grown-up can't quite tell yet.",
  },
  {
    pathwayCode: 'WM',
    groupNumber: 1,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Picks colors and materials on purpose to build a small picture, sculpture, or project.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 1,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Talks through a simple plan before starting ("I\'m making a rocket ship!") and keeps working toward that idea.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 2,
    markerNumber: 1,
    ageBand: 1,
    skillText:
      'Uses one object to stand in for another, like holding a block up to an ear as a "phone."',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 2,
    markerNumber: 2,
    ageBand: 2,
    skillText:
      'Acts out a familiar routine with toys or stuffed animals, like feeding a doll or tucking in a teddy bear.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 2,
    markerNumber: 3,
    ageBand: 2,
    skillText: 'Takes on a simple pretend role, announcing "I\'m a doggy!" and acting the part.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 2,
    markerNumber: 4,
    ageBand: 3,
    skillText: 'Invents a short pretend story with a beginning and an idea of what happens next.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 2,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Plays pretend alongside another child, taking turns adding new ideas to a shared story.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 3,
    markerNumber: 1,
    ageBand: 0,
    skillText: 'Bounces, sways, or kicks in response to music, singing, or a steady beat.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 3,
    markerNumber: 2,
    ageBand: 1,
    skillText:
      'Bangs, shakes, or taps to make a sound on purpose, and does it again because it was fun.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 3,
    markerNumber: 3,
    ageBand: 2,
    skillText:
      'Moves in different ways to match the music, like stomping to something fast and tiptoeing to something slow.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 3,
    markerNumber: 4,
    ageBand: 3,
    skillText:
      'Makes up a new movement, sound, or short tune of their own, instead of only copying others.',
  },
  {
    pathwayCode: 'WM',
    groupNumber: 3,
    markerNumber: 5,
    ageBand: 4,
    skillText:
      'Uses voice, an instrument, or their whole body to show a feeling or act out a made-up story.',
  },
]

/** Every skill marker's full_code, computed the one true way. */
export function seedFullCode(marker: SkillMarkerSeed): string {
  return formatFullCode({
    pathwayCode: marker.pathwayCode,
    groupNumber: marker.groupNumber,
    markerNumber: marker.markerNumber,
  })
}
