import type {Assignment} from "./calendar/CalendarTypes.ts";
import {
    BeakerIcon,
    BookOpenIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
    UserGroupIcon
} from "@heroicons/react/24/solid";

export const assignmentTypes: Record<string, Assignment> = {
    "Essay": {
        id: 1,
        name: "Essay",
        icon: DocumentTextIcon,
        events: [
            { name: "Read Instructions", percentage: 5,
                instructions: [
                    "Read the full assignment instructions and any associated materials",
                    "Read the rubric! Pay attention to specific details such as number/type of sources needed, suggested structure, and referencing style",
                    "Ask clarifying questions if you are unsure about the instructions" ],
                resources: ["This is a test","So is this","And this"]
            },
            { name: "Break down Question", percentage: 5,
                instructions: [
                    "Break down the assignment question and highlight key words",
                    "Consider the task words (i.e. argue, summarise, describe) to determine exactly what you are being asked to do",
                    "Think about the topic, and about refining the scope of what you will write about (the more refined the scope is, the easier it is to write and research)",
                    "Come along to a drop-in or writing consultation [ASC-WEB] if you want advice on this step"]
            },
            { name: "Do some general research", percentage: 15,
                instructions: [
                    "Consider what you already know about the topic, and what you need to find out",
                    "Do some general reading on the topic (just enough to be able to have an informed view to enable you to start planning; don’t read everything yet!)",
                    "From this general reading you can start to form an idea of what position or stance you might choose to take in response to the question",
                    "Come along to a drop-in or book a librarian for help with search strategies [LIB-BOOK]"]
            },
            { name: "Brainstorm and plan your answers", percentage: 15,
                instructions: ["Do some brainstorming on the topic/sub-topics",
                    "Decide on your thesis or position (i.e. what is your answer to the assignment question)",
                    "Consider how to further refine the scope of your position to make is as specific as possible (refine scope around time, cohort, location, aspect)",
                    "Decide how you are going to substantiate your position; what will be your main points?",
                    "Write out a plan detailing what each of your paragraphs will focus on (stick to one main point per paragraph)",
                    "Do further, more targeted research to find specific evidence for each of your paragraphs"]
            },
            { name: "Alternate writing and further research", percentage: 40,
                instructions: [
                    "Begin writing, alternating between writing and research",
                    "Continue doing targeted research while you are writing to ensure each paragraph is supported if you deviate from your plan or go in a slightly different direction",
                    "Structure your introduction and conclusion using the general > specific principle",
                    "Make sure each of your paragraphs is roughly similar in length and covers one main point which is indicated by the topic sentence",
                    "Ensure you are integrating evidence into each paragraph using quotes and paraphrasing, check out the Academic Skills Guides for advice on writing [ASC-GUID]",
                    "Reference as you go, to ensure you don’t miss anything [LIB-BOOK]"]
            },
            { name: "Edit and redraft", percentage: 20,
                instructions: [
                    "Edit and redraft, focusing on macro features first (structure, flow, sources)",
                    "Check that your paragraph structure is sufficiently linked back to your overall position or stance, and that you have answered the assignment question [ASC-WEB]",
                    "Once you are happy with the structure, edit for micro features (wording, references, grammar)",
                    "Double check your references according to the UWA Style Guide [LIB-REF] Do a final proofread (try reading out aloud)",
                    "Check against the rubric that you have completed all requirements"]
            },
            { name: "Submit", percentage: 0,
                instructions: ["Check the submission receipt to make sure your work has been received!"]
            },

        ]
    },
    "Lab Report": {
        id: 2,
        name: "Lab Report",
        icon: BeakerIcon,
        events: [
            { name: "Understand the task", percentage: 5 },
            { name: "Review background and plan your introduction", percentage: 15 },
            { name: "Draft your method", percentage: 15 },
            { name: "Analyse data and draft your Results", percentage: 20 },
            { name: "Draft Discussion – Results – Background loop", percentage: 30 },
            { name: "Final polish and integration", percentage: 15 },
            { name: "Submit", percentage: 0 },

        ]
    },
    "Reflective Writing": {
        id: 3,
        name: "Reflective Writing",
        icon: BookOpenIcon,
        events: [
            { name: "Reflect", percentage: 5 },
            { name: "Write", percentage: 75 },
            { name: "Reflect on that writing", percentage: 10 },
            { name: "Write on that reflecting", percentage: 10 },
            { name: "Submit", percentage: 0 },
        ]
    },
    "Group Project": {
        id: 4,
        name: "Group Project",
        icon: UserGroupIcon,
        events: [
            { name: "Assemble a team", percentage: 10 },
            { name: "Bond with the crew", percentage: 10 },
            { name: "Endure hardships together", percentage: 15 },
            { name: "Face rising tension", percentage: 15 },
            { name: "One of your disciples betrays you", percentage: 20 },
            { name: "Crucifixion", percentage: 20 },
            { name: "Oh wait nevermind you somehow made it back", percentage: 10 },
            { name: "Dance sequence", percentage: 0 },
        ]
    },
    "Presentation": {
        id: 5,
        name: "Presentation",
        icon: PresentationChartLineIcon,
        events: [
            { name: "Read the assignment instructions", percentage: 10 },
            { name: "Read the assignment rubric", percentage: 10 },
            { name: "Research your topic", percentage: 20 },
            { name: "Draft an outline of what you will cover", percentage: 15 },
            { name: "Structure your content", percentage: 15 },
            { name: "Design your slides", percentage: 20 },
            { name: "Practice your presentation", percentage: 10 },
        ]
    },
}