import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Waypoint",
      nav: {
        home: "Home",
        trips: "My Trips",
        feed: "Discover",
        features: "Features",
        how: "How it works",
        pricing: "Pricing",
        stories: "Stories",
        profile: "Profile",
      },
      actions: {
        startPlanning: "Start planning",
        login: "Log in",
        logout: "Log out",
        buildItinerary: "Build your itinerary",
        seeHow: "See how it works",
        openItinerary: "Open itinerary",
      },
      labels: {
        language: "Language",
        loading: "Loading...",
      },
      home: {
        title: "Home",
        subtitle: "Your trip workspace is ready.",
      },
      tripPlanner: {
        eyebrow: "Free-phase trip planner",
        title: "Build a draft trip plan",
        subtitle: "Turn a destination into a day-by-day flow you can edit.",
        form: {
          destinationLabel: "Destination",
          destinationPlaceholder: "e.g. Paris, Tokyo, New York",
          daysLabel: "Days",
          paceLabel: "Pace",
        },
        pace: {
          relaxed: "Relaxed",
          balanced: "Balanced",
          fast: "Fast-paced",
        },
        actions: {
          generate: "Generate plan",
          generating: "Generating...",
          regenerate: "Regenerate plan",
          regenerateDay: "Regenerate day",
          regeneratingDay: "Regenerating...",
          editDay: "Edit day",
          doneEditing: "Done editing",
          saveTrip: "Save trip",
        },
        saveTrip: {
          title: "Save this plan",
          nameLabel: "Trip name",
          namePlaceholder: "e.g. Paris weekend",
          saving: "Saving...",
          success: "Trip saved.",
          viewMyTrips: "View my trips",
        },
        results: {
          title: "Your draft itinerary",
          summary: "{{days}} days in {{destination}}",
          pace: "Pace: {{pace}}",
          meta: "Estimated {{hours}} hrs/day • {{stops}} stops total",
          focus: "Focus area: {{area}}",
          dayLabel: "Day {{day}}",
          totalTime: "Total time: {{hours}} hrs",
          hoursShort: "{{hours}} hrs",
          itemMeta: "{{hours}} hrs · {{category}}",
          generated: "Generated from offline suggestions.",
          fallback:
            "Showing a general plan because this destination is not in our starter dataset yet.",
        },
        map: {
          title: "Map preview",
          source: "OpenStreetMap",
          loading: "Loading map preview...",
          error: "We couldn't load the map preview.",
          noResults: "No map match found for this destination.",
          open: "Open in map",
          alt: "Map of {{destination}}",
        },
        slots: {
          morning: "Morning",
          afternoon: "Afternoon",
          evening: "Evening",
        },
        categories: {
          landmark: "Landmark",
          museum: "Museum",
          neighborhood: "Neighborhood",
          park: "Park",
          market: "Market",
          experience: "Experience",
          food: "Food",
          nightlife: "Nightlife",
          relax: "Relax",
          viewpoint: "Viewpoint",
        },
        empty: {
          title: "Start with a destination",
          copy: "Enter a city and we will draft a day-by-day flow for you.",
        },
        helper: "No live data yet. This is a free planning draft you can edit.",
        status: {
          error: "We couldn't build a plan. Try again.",
          missingDestination: "Please enter a destination.",
        },
      },
      trips: {
        title: "My Trips",
        empty: "No trips yet.",
        createNew: "Create new trip",
        status: {
          upcoming: "Upcoming",
          active: "Active",
          completed: "Completed",
          archived: "Archived",
        },
        days: "{{count}} days",
        view: "View",
        edit: "Edit",
        delete: "Delete",
        archive: "Archive",
        unarchive: "Unarchive",
        markComplete: "Mark complete",
        saveChanges: "Save changes",
        cancel: "Cancel",
        confirmDelete: "Delete this trip? This cannot be undone.",
        deleteSuccess: "Trip deleted.",
        archiveSuccess: "Trip archived.",
        unarchiveSuccess: "Trip unarchived.",
        updateSuccess: "Trip updated.",
        editTrip: "Edit trip",
        showArchived: "Show archived",
        hideArchived: "Hide archived",
        map: "Map",
        showMyLocation: "Show my location",
        hideMyLocation: "Hide my location",
        locationLoading: "Getting location...",
        etaToNext: "~{{km}} km to {{name}} · ~{{min}} min",
        youAreCloseTo: "Very close to {{name}}",
        nextStop: "Next stop",
        farFromNextStop: "Far from next stop — consider adjusting your schedule.",
        chat: "Trip chat",
        chatEmpty: "No messages yet. Say something!",
        chatYou: "You",
        chatMember: "Trip member",
        chatPlaceholder: "Type a message...",
        chatSend: "Send",
        attachImage: "Attach image",
        removeImage: "Remove image",
        imageTooLarge: "Image must be 5 MB or less.",
        transportation: "Transportation",
        howAreYouGettingThere: "How are you getting there?",
        transportMode: {
          flight: "Flight",
          train: "Train",
          bus: "Bus",
        },
        nearestAirport: "Nearest airport",
        nearestTrain: "Nearest train",
        nearestBus: "Nearest bus",
        makePublic: "Make public",
        makePrivate: "Make private",
        makePublicSuccess: "Trip is now public and visible in the feed.",
        makePrivateSuccess: "Trip is now private.",
        invite: "Invite",
        inviteTitle: "Invite collaborators",
        inviteRole: "Role",
        "inviteRole.viewer": "Viewer (read-only)",
        "inviteRole.editor": "Editor (can edit)",
        createInvite: "Create invite code",
        inviteCodeLabel: "Share this code with collaborators:",
        copyCode: "Copy code",
        copyLink: "Copy link",
        linkCopied: "Link copied!",
        copyLinkFailed: "Could not copy link.",
        inviteCopied: "Code copied to clipboard.",
        inviteExpires: "Code expires in 24 hours.",
        close: "Close",
        redeemCode: "Redeem code",
        redeemTitle: "Have an invite code?",
        redeemPlaceholder: "Enter 8-character code",
        redeemSuccess: "You now have access to this trip.",
        peopleOnTrip: "People on this trip",
        role: {
          owner: "Owner",
          viewer: "Viewer",
          editor: "Editor",
        },
        remove: "Remove",
        removeCollaborator: "Remove from trip",
        collaboratorRemoved: "Collaborator removed.",
        removeCollaboratorFailed: "Could not remove collaborator.",
        galleryTitle: "Gallery",
        viewGallery: "View gallery",
        addCover: "Add cover",
        changeCover: "Change cover",
        addToGallery: "Add to gallery",
        galleryEmpty: "No images in this trip yet.",
        galleryEmptyTitle: "No photos yet",
        uploadingImage: "Uploading image...",
        galleryThumbs: "Gallery thumbnails",
        prevImage: "Previous image",
        nextImage: "Next image",
        coverUpdated: "Cover updated.",
        addedToGallery: "Added to gallery.",
        backToTrip: "Back to trip",
        comments: "Comments",
        addComment: "Add a comment...",
        post: "Post",
      },
      feed: {
        title: "Discover",
        subtitle: "Public trips from the community",
        empty: "No public trips yet.",
        filterPlaceholder: "Filter by destination...",
        interestPlaceholder: "Filter by interest (e.g. food, history)...",
        filter: "Filter",
        by: "by",
        days: "{{count}} days",
        view: "View",
        like: "Like",
        unlike: "Unlike",
        comments: "Comments",
        noComments: "No comments yet.",
        addComment: "Add a comment...",
        postComment: "Post",
        commentAuthor: "Someone",
      },
      landing: {
        hero: {
          eyebrow: "Trip organization platform",
          title: "Plan trips that feel effortless from the first idea.",
          lead:
            "Keep itineraries, budgets, and group chats in one place. Waypoint helps your crew make decisions fast so you can focus on the trip.",
          primary: "Build your itinerary",
          secondary: "See how it works",
        },
        stats: [
          { value: "4.9", label: "Average organizer rating" },
          { value: "52k", label: "Trips coordinated in 2025" },
          { value: "12 hrs", label: "Saved per group on average" },
        ],
        card: {
          header: "Upcoming trip",
          dates: "Apr 18 - Apr 24",
          name: "Coastal Portugal Escape",
          travelersConfirmedLabel: "travelers confirmed",
          travelersPendingLabel: "pending",
          budgetLabel: "per traveler budget goal",
          ideasLabel: "saved ideas",
          bookedLabel: "booked",
          progress: "68% of the plan is finalized",
        },
        features: {
          title: "Everything your group needs to move quickly",
          subtitle:
            "Waypoint keeps decisions organized with shared to-do lists, calendars, and budgets that update in real time.",
          items: [
            {
              title: "Shared itinerary",
              copy:
                "Drag, drop, and vote on activities. Each change updates every traveler instantly.",
            },
            {
              title: "Smart budget tracking",
              copy:
                "Split costs automatically, set caps, and see what is still outstanding in seconds.",
            },
            {
              title: "Live group updates",
              copy:
                "Built-in messaging, reminders, and checklists keep everyone on the same page.",
            },
            {
              title: "Trip templates",
              copy:
                "Start with curated templates for weekend getaways, retreats, or international tours.",
            },
            {
              title: "Vendor marketplace",
              copy:
                "Book stays, transport, and experiences directly from trusted partners.",
            },
            {
              title: "Offline access",
              copy:
                "Download your final plan so it is ready even when you are off the grid.",
            },
          ],
        },
        how: {
          title: "How Waypoint works",
          subtitle: "Go from inspiration to confirmation in three focused steps.",
          steps: [
            {
              title: "Create your trip hub",
              copy:
                "Add dates, invite travelers, and drop in ideas from any device.",
            },
            {
              title: "Vote and finalize",
              copy:
                "Collect preferences, lock in bookings, and auto-build the daily schedule.",
            },
            {
              title: "Travel together",
              copy:
                "Share live updates, maps, and confirmations from one seamless itinerary.",
            },
          ],
        },
        demo: {
          title: "See your trip timeline at a glance",
          subtitle:
            "Waypoint surfaces daily agendas, transit windows, and group check-ins so no one is left guessing.",
          checklist: [
            "Automatically align arrival times and transport.",
            "Pin meeting points for every day.",
            "Set push reminders for the group.",
          ],
          timeline: [
            {
              time: "8:00 AM",
              title: "Meet in Lisbon",
              detail: "Pickup and breakfast at Avenida.",
            },
            {
              time: "11:30 AM",
              title: "Coastal drive",
              detail: "Van booked, luggage packed.",
            },
            {
              time: "3:00 PM",
              title: "Check-in",
              detail: "Hotel Bahia, rooms ready.",
            },
            {
              time: "7:30 PM",
              title: "Welcome dinner",
              detail: "Group table reserved.",
            },
          ],
        },
        stories: {
          title: "Teams and friend groups trust Waypoint",
          subtitle:
            "From offsites to bachelor parties, organizers rely on one shared source of truth.",
          testimonials: [
            {
              quote:
                "We planned a company retreat for 24 people and never once lost track of expenses. The shared itinerary kept everyone aligned.",
              name: "Maya R.",
              title: "People Operations, Northwind",
            },
            {
              quote:
                "Waypoint made it easy to vote on activities. We saved hours of back-and-forth and still felt heard.",
              name: "Jordan P.",
              title: "Travel organizer, Atlas Crew",
            },
          ],
        },
        pricing: {
          title: "Simple pricing for every trip",
          subtitle: "Start free, upgrade when you need deeper coordination.",
          tiers: [
            {
              name: "Starter",
              price: "$0",
              note: "Perfect for weekend getaways.",
              features: [
                "One active trip",
                "Group voting",
                "Basic budget tracking",
              ],
              cta: "Get started",
              variant: "ghost",
            },
            {
              name: "Collective",
              price: "$12",
              note: "Per organizer per month.",
              features: [
                "Unlimited trips",
                "Live messaging",
                "Shared templates",
                "Automated reminders",
              ],
              cta: "Start free trial",
              variant: "primary",
              featured: true,
              badge: "Most popular",
            },
            {
              name: "Enterprise",
              price: "Custom",
              note: "Built for travel teams at scale.",
              features: ["Dedicated concierge", "Advanced reporting", "Admin controls"],
              cta: "Contact sales",
              variant: "ghost",
            },
          ],
        },
        cta: {
          title: "Ready to organize your next trip?",
          subtitle:
            "Create your trip hub in minutes and invite your crew to start planning together.",
          label: "Work email",
          placeholder: "you@team.com",
          button: "Start planning",
          note: "Free 14-day trial. No credit card required.",
          helper: "Want a full account instead?",
          helperLink: "Create one now",
        },
      },
      footer: {
        blurb:
          "One shared space to organize, book, and experience unforgettable group travel.",
        product: "Product",
        company: "Company",
        resources: "Resources",
        links: {
          features: "Features",
          pricing: "Pricing",
          demo: "Demo",
          about: "About",
          careers: "Careers",
          contact: "Contact",
          support: "Support",
          guides: "Guides",
          privacy: "Privacy",
        },
        bottom: {
          copyright: "Copyright 2026 Waypoint. All rights reserved.",
          terms: "Terms",
          privacy: "Privacy",
          security: "Security",
        },
      },
      auth: {
        messages: {
          required: "Email and password are required.",
          passwordMismatch: "Passwords do not match.",
          loginSuccess: "Login successful.",
          registerSuccess: "Account created. You can now log in.",
          profileHint: "Account created. Update your profile details next.",
        },
        login: {
          eyebrow: "Welcome back",
          title: "Log in to keep planning together.",
          subtitle:
            "Access your shared itineraries, budgets, and group updates in one place.",
          list: [
            "Pick up exactly where your group left off.",
            "See real-time updates and booking statuses.",
            "Stay aligned with automated reminders.",
          ],
          formTitle: "Log in",
          formSubtitle: "Use the email you registered with.",
          emailLabel: "Email",
          passwordLabel: "Password",
          button: "Log in",
          loading: "Signing in...",
          footer: "New to Waypoint?",
          footerLink: "Create an account",
          signedInAs: "Signed in as {{email}}",
          profileCta: "Go to profile",
        },
        register: {
          eyebrow: "Start planning",
          title: "Create your Waypoint account.",
          subtitle:
            "Set up your trip hub, invite travelers, and keep every plan in sync.",
          list: [
            "Organize itineraries, budgets, and checklists.",
            "Keep every traveler aligned with real-time updates.",
            "Move from idea to booked in one workspace.",
          ],
          formTitle: "Create account",
          formSubtitle: "Use your work email to get started.",
          emailLabel: "Email",
          passwordLabel: "Password",
          confirmLabel: "Confirm password",
          button: "Create account",
          loading: "Creating account...",
          footer: "Already have an account?",
          footerLink: "Log in",
          profileCta: "Finish profile setup",
        },
      },
      profile: {
        title: "Profile settings",
        subtitle: "Update your contact details, preferences, and language.",
        intro: "Keep your profile accurate so trip updates reach the right people.",
        empty: {
          title: "Log in to manage your profile",
          copy:
            "Sign in to update your contact details, currency, and language preferences.",
          button: "Log in",
        },
        form: {
          email: "Email",
          phone: "Phone number",
          country: "Country",
          language: "Language",
          currency: "Currency",
          interests: "Interests",
          preferredDestinations: "Preferred destinations",
          storage: "Storage",
        },
        placeholders: {
          email: "you@team.com",
          phone: "+1 555 000 0000",
          country: "Select your country",
          interests: "e.g. history, food, nature (comma-separated)",
          preferredDestinations: "e.g. Paris, Tokyo (comma-separated)",
        },
        storage: {
          used: "{{used}} MB / {{limit}} MB",
        },
        actions: {
          save: "Save changes",
          saving: "Saving...",
        },
        status: {
          saved: "Profile updated successfully.",
          loadError: "We couldn't load your profile.",
          saveError: "We couldn't save your changes.",
        },
      },
      languages: {
        en: "English",
        hi: "Hindi",
        ml: "Malayalam",
        ar: "Arabic",
        es: "Spanish",
        de: "German",
      },
    },
  },
  hi: {
    translation: {
      appName: "Waypoint",
      nav: {
        home: "होम",
        features: "विशेषताएं",
        how: "कैसे काम करता है",
        pricing: "मूल्य निर्धारण",
        stories: "कहानियां",
        profile: "प्रोफ़ाइल",
      },
      actions: {
        startPlanning: "योजना शुरू करें",
        login: "लॉग इन",
        logout: "लॉग आउट",
        buildItinerary: "अपनी यात्रा योजना बनाएं",
        seeHow: "देखें कैसे काम करता है",
        openItinerary: "यात्रा योजना खोलें",
      },
      labels: {
        language: "भाषा",
        loading: "लोड हो रहा है...",
      },
      home: {
        title: "होम",
        subtitle: "आपका ट्रिप वर्कस्पेस तैयार है।",
      },
      tripPlanner: {
        eyebrow: "फ्री ट्रिप प्लानर",
        title: "ड्राफ्ट यात्रा योजना बनाएं",
        subtitle: "गंतव्य से दिन-दर-दिन का प्लान तैयार करें जिसे आप संपादित कर सकें।",
        form: {
          destinationLabel: "गंतव्य",
          destinationPlaceholder: "जैसे Paris, Tokyo, New York",
          daysLabel: "दिन",
          paceLabel: "गति",
        },
        pace: {
          relaxed: "आरामदायक",
          balanced: "संतुलित",
          fast: "तेज़",
        },
        actions: {
          generate: "योजना बनाएं",
          generating: "तैयार हो रहा है...",
          regenerate: "योजना फिर बनाएं",
          regenerateDay: "दिन फिर बनाएं",
          regeneratingDay: "फिर से बन रहा है...",
          editDay: "दिन संपादित करें",
          doneEditing: "संपादन पूरा करें",
        },
        results: {
          title: "आपकी ड्राफ्ट यात्रा योजना",
          summary: "{{destination}} में {{days}} दिन",
          pace: "गति: {{pace}}",
          meta: "अनुमानित {{hours}} घंटे/दिन • कुल {{stops}} स्टॉप",
          focus: "मुख्य क्षेत्र: {{area}}",
          dayLabel: "दिन {{day}}",
          totalTime: "कुल समय: {{hours}} घंटे",
          hoursShort: "{{hours}} घंटे",
          itemMeta: "{{hours}} घंटे · {{category}}",
          generated: "ऑफ़लाइन सुझावों से जनरेट किया गया।",
          fallback:
            "यह गंतव्य हमारे शुरुआती डेटा में नहीं है, इसलिए सामान्य योजना दिखाई गई है।",
        },
        map: {
          title: "मैप प्रीव्यू",
          source: "OpenStreetMap",
          loading: "मैप लोड हो रहा है...",
          error: "मैप लोड नहीं हो सका।",
          noResults: "इस गंतव्य के लिए मैप नहीं मिला।",
          open: "मैप खोलें",
          alt: "{{destination}} का मैप",
        },
        slots: {
          morning: "सुबह",
          afternoon: "दोपहर",
          evening: "शाम",
        },
        categories: {
          landmark: "लैंडमार्क",
          museum: "संग्रहालय",
          neighborhood: "इलाका",
          park: "पार्क",
          market: "बाज़ार",
          experience: "अनुभव",
          food: "भोजन",
          nightlife: "नाइटलाइफ़",
          relax: "आराम",
          viewpoint: "दृश्य स्थल",
        },
        empty: {
          title: "एक गंतव्य से शुरू करें",
          copy: "शहर दर्ज करें और हम दिन-दर-दिन का प्लान बनाएंगे।",
        },
        helper: "अभी लाइव डेटा नहीं है। यह एक मुफ्त ड्राफ्ट है जिसे आप बदल सकते हैं।",
        status: {
          error: "योजना नहीं बन सकी। फिर से प्रयास करें।",
          missingDestination: "कृपया गंतव्य दर्ज करें।",
        },
      },
      landing: {
        hero: {
          eyebrow: "यात्रा संगठन प्लेटफ़ॉर्म",
          title: "पहले आइडिया से ही आसान यात्राएं प्लान करें।",
          lead:
            "यात्रा कार्यक्रम, बजट और समूह चैट एक जगह रखें। Waypoint आपके समूह को तेज़ी से निर्णय लेने में मदद करता है ताकि आप यात्रा पर ध्यान दे सकें।",
          primary: "अपनी यात्रा योजना बनाएं",
          secondary: "देखें कैसे काम करता है",
        },
        stats: [
          { value: "4.9", label: "औसत आयोजक रेटिंग" },
          { value: "52k", label: "2025 में समन्वित यात्राएं" },
          { value: "12 hrs", label: "प्रति समूह औसतन बचाया समय" },
        ],
        card: {
          header: "आगामी यात्रा",
          dates: "Apr 18 - Apr 24",
          name: "पुर्तगाल का तटीय सफर",
          travelersConfirmedLabel: "यात्री पुष्टि",
          travelersPendingLabel: "लंबित",
          budgetLabel: "प्रति यात्री बजट लक्ष्य",
          ideasLabel: "सेव किए गए आइडिया",
          bookedLabel: "बुक किए गए",
          progress: "योजना का 68% पूरा हो चुका है",
        },
        features: {
          title: "आपके समूह को तेज़ी से आगे बढ़ाने के लिए सब कुछ",
          subtitle:
            "Waypoint साझा टू-डू सूचियों, कैलेंडरों और बजट के साथ निर्णयों को व्यवस्थित रखता है, जो रीयल-टाइम में अपडेट होते हैं।",
          items: [
            {
              title: "साझा यात्रा कार्यक्रम",
              copy:
                "गतिविधियाँ ड्रैग-ड्रॉप करें और वोट करें। हर बदलाव तुरंत सभी यात्रियों तक पहुँचता है।",
            },
            {
              title: "स्मार्ट बजट ट्रैकिंग",
              copy:
                "खर्च स्वतः विभाजित करें, सीमा तय करें और बकाया तुरंत देखें।",
            },
            {
              title: "लाइव समूह अपडेट",
              copy:
                "इन-बिल्ट संदेश, रिमाइंडर और चेकलिस्ट सभी को एक पेज पर रखते हैं।",
            },
            {
              title: "यात्रा टेम्पलेट्स",
              copy:
                "वीकेंड गेटवे, रिट्रीट या अंतरराष्ट्रीय दौरों के लिए क्यूरेटेड टेम्पलेट्स से शुरुआत करें।",
            },
            {
              title: "विक्रेता मार्केटप्लेस",
              copy:
                "विश्वसनीय भागीदारों से रहने, परिवहन और अनुभव बुक करें।",
            },
            {
              title: "ऑफ़लाइन एक्सेस",
              copy:
                "अंतिम योजना डाउनलोड करें ताकि नेटवर्क न होने पर भी तैयार रहे।",
            },
          ],
        },
        how: {
          title: "Waypoint कैसे काम करता है",
          subtitle: "प्रेरणा से पुष्टि तक तीन आसान कदम।",
          steps: [
            {
              title: "अपना ट्रिप हब बनाएं",
              copy:
                "तिथियां जोड़ें, यात्रियों को आमंत्रित करें, और किसी भी डिवाइस से आइडिया जोड़ें।",
            },
            {
              title: "वोट करें और अंतिम रूप दें",
              copy:
                "पसंद एकत्र करें, बुकिंग फाइनल करें और दैनिक शेड्यूल स्वतः बनाएं।",
            },
            {
              title: "साथ यात्रा करें",
              copy:
                "एक ही यात्रा कार्यक्रम से लाइव अपडेट, मैप और पुष्टि साझा करें।",
            },
          ],
        },
        demo: {
          title: "अपनी यात्रा टाइमलाइन एक नज़र में देखें",
          subtitle:
            "Waypoint दैनिक एजेंडा, ट्रांजिट विंडो और समूह चेक-इन दिखाता है ताकि कोई अनुमान न लगाए।",
          checklist: [
            "आगमन समय और परिवहन स्वतः मिलान करें।",
            "हर दिन के लिए मीटिंग पॉइंट पिन करें।",
            "समूह के लिए पुश रिमाइंडर सेट करें।",
          ],
          timeline: [
            {
              time: "8:00 AM",
              title: "लिस्बन में मिलें",
              detail: "अवेनिडा में पिकअप और नाश्ता।",
            },
            {
              time: "11:30 AM",
              title: "तटीय ड्राइव",
              detail: "वैन बुक, सामान पैक।",
            },
            {
              time: "3:00 PM",
              title: "चेक-इन",
              detail: "होटल बहिया, कमरे तैयार।",
            },
            {
              time: "7:30 PM",
              title: "स्वागत डिनर",
              detail: "समूह के लिए टेबल आरक्षित।",
            },
          ],
        },
        stories: {
          title: "टीम और मित्र समूह Waypoint पर भरोसा करते हैं",
          subtitle:
            "ऑफसाइट से बैचलर पार्टी तक, आयोजक एक साझा स्रोत पर भरोसा करते हैं।",
          testimonials: [
            {
              quote:
                "हमने 24 लोगों के लिए एक कंपनी रिट्रीट प्लान किया और खर्चों का कभी नियंत्रण नहीं खोया। साझा यात्रा कार्यक्रम ने सभी को एकजुट रखा।",
              name: "Maya R.",
              title: "People Operations, Northwind",
            },
            {
              quote:
                "Waypoint ने गतिविधियों पर वोट करना आसान बना दिया। हमने घंटों की बातचीत बचाई और फिर भी सभी की राय बनी रही।",
              name: "Jordan P.",
              title: "Travel organizer, Atlas Crew",
            },
          ],
        },
        pricing: {
          title: "हर यात्रा के लिए सरल मूल्य",
          subtitle: "मुफ्त से शुरू करें, अधिक समन्वय के लिए अपग्रेड करें।",
          tiers: [
            {
              name: "स्टार्टर",
              price: "$0",
              note: "वीकेंड गेटवे के लिए बेहतरीन।",
              features: ["एक सक्रिय यात्रा", "समूह वोटिंग", "बुनियादी बजट ट्रैकिंग"],
              cta: "शुरू करें",
              variant: "ghost",
            },
            {
              name: "कलेक्टिव",
              price: "$12",
              note: "प्रति आयोजक प्रति माह।",
              features: [
                "अनलिमिटेड यात्राएं",
                "लाइव मैसेजिंग",
                "साझा टेम्पलेट्स",
                "स्वचालित रिमाइंडर",
              ],
              cta: "मुफ़्त ट्रायल शुरू करें",
              variant: "primary",
              featured: true,
              badge: "सबसे लोकप्रिय",
            },
            {
              name: "एंटरप्राइज",
              price: "Custom",
              note: "बड़े ट्रैवल टीमों के लिए बनाया गया।",
              features: ["समर्पित कंसीयर्ज", "उन्नत रिपोर्टिंग", "एडमिन नियंत्रण"],
              cta: "सेल्स से संपर्क करें",
              variant: "ghost",
            },
          ],
        },
        cta: {
          title: "अपनी अगली यात्रा संगठित करने के लिए तैयार?",
          subtitle:
            "मिनटों में अपना ट्रिप हब बनाएं और अपने समूह को साथ योजना बनाने के लिए आमंत्रित करें।",
          label: "कार्य ईमेल",
          placeholder: "you@team.com",
          button: "योजना शुरू करें",
          note: "14-दिन का मुफ्त ट्रायल। क्रेडिट कार्ड की जरूरत नहीं।",
          helper: "क्या आपको पूरा खाता चाहिए?",
          helperLink: "अभी बनाएं",
        },
      },
      footer: {
        blurb:
          "समूह यात्राओं को संगठित, बुक और अनुभव करने के लिए एक साझा स्थान।",
        product: "उत्पाद",
        company: "कंपनी",
        resources: "संसाधन",
        links: {
          features: "विशेषताएं",
          pricing: "मूल्य निर्धारण",
          demo: "डेमो",
          about: "हमारे बारे में",
          careers: "करियर",
          contact: "संपर्क",
          support: "सपोर्ट",
          guides: "गाइड्स",
          privacy: "गोपनीयता",
        },
        bottom: {
          copyright: "Copyright 2026 Waypoint. All rights reserved.",
          terms: "नियम",
          privacy: "गोपनीयता",
          security: "सुरक्षा",
        },
      },
      auth: {
        messages: {
          required: "ईमेल और पासवर्ड आवश्यक हैं।",
          passwordMismatch: "पासवर्ड मेल नहीं खाते।",
          loginSuccess: "लॉग इन सफल।",
          registerSuccess: "खाता बनाया गया। अब लॉग इन करें।",
          profileHint: "खाता बनाया गया। अब अपनी प्रोफ़ाइल अपडेट करें।",
        },
        login: {
          eyebrow: "फिर से स्वागत है",
          title: "योजना जारी रखने के लिए लॉग इन करें।",
          subtitle:
            "अपने साझा यात्रा कार्यक्रम, बजट और समूह अपडेट एक जगह देखें।",
          list: [
            "जहां आपके समूह ने छोड़ा था वहीं से शुरू करें।",
            "रीयल-टाइम अपडेट और बुकिंग स्थिति देखें।",
            "स्वचालित रिमाइंडर से सभी को संरेखित रखें।",
          ],
          formTitle: "लॉग इन",
          formSubtitle: "अपने पंजीकृत ईमेल का उपयोग करें।",
          emailLabel: "ईमेल",
          passwordLabel: "पासवर्ड",
          button: "लॉग इन",
          loading: "साइन इन हो रहा है...",
          footer: "नई Waypoint पर?",
          footerLink: "खाता बनाएं",
          signedInAs: "{{email}} के रूप में लॉग इन किया गया",
          profileCta: "प्रोफ़ाइल देखें",
        },
        register: {
          eyebrow: "योजना शुरू करें",
          title: "अपना Waypoint खाता बनाएं।",
          subtitle:
            "अपना ट्रिप हब सेट करें, यात्रियों को आमंत्रित करें और सभी योजनाओं को सिंक रखें।",
          list: [
            "यात्रा कार्यक्रम, बजट और चेकलिस्ट व्यवस्थित करें।",
            "रीयल-टाइम अपडेट से सभी यात्रियों को संरेखित रखें।",
            "एक ही वर्कस्पेस में आइडिया से बुकिंग तक जाएं।",
          ],
          formTitle: "खाता बनाएं",
          formSubtitle: "शुरू करने के लिए अपना कार्य ईमेल उपयोग करें।",
          emailLabel: "ईमेल",
          passwordLabel: "पासवर्ड",
          confirmLabel: "पासवर्ड की पुष्टि करें",
          button: "खाता बनाएं",
          loading: "खाता बन रहा है...",
          footer: "पहले से खाता है?",
          footerLink: "लॉग इन",
          profileCta: "प्रोफ़ाइल पूरा करें",
        },
      },
      profile: {
        title: "प्रोफ़ाइल सेटिंग्स",
        subtitle: "अपनी संपर्क जानकारी, पसंद और भाषा अपडेट करें।",
        intro: "अपनी प्रोफ़ाइल अपडेट रखें ताकि यात्रा अपडेट सही लोगों तक पहुंचे।",
        empty: {
          title: "प्रोफ़ाइल प्रबंधित करने के लिए लॉग इन करें",
          copy:
            "अपनी संपर्क जानकारी, मुद्रा और भाषा पसंद अपडेट करने के लिए साइन इन करें।",
          button: "लॉग इन",
        },
        form: {
          email: "ईमेल",
          phone: "फोन नंबर",
          country: "देश",
          language: "भाषा",
          currency: "मुद्रा",
        },
        placeholders: {
          email: "you@team.com",
          phone: "+1 555 000 0000",
          country: "अपना देश चुनें",
        },
        actions: {
          save: "परिवर्तन सहेजें",
          saving: "सहेजा जा रहा है...",
        },
        status: {
          saved: "प्रोफ़ाइल सफलतापूर्वक अपडेट हुई।",
          loadError: "हम आपकी प्रोफ़ाइल लोड नहीं कर पाए।",
          saveError: "हम आपके परिवर्तन सहेज नहीं पाए।",
        },
      },
      languages: {
        en: "अंग्रेज़ी",
        hi: "हिंदी",
        ml: "मलयालम",
        ar: "अरबी",
        es: "स्पेनिश",
        de: "जर्मन",
      },
    },
  },
  ml: {
    translation: {
      appName: "Waypoint",
      nav: {
        home: "ഹോം",
        features: "സവിശേഷതകൾ",
        how: "എങ്ങനെ പ്രവർത്തിക്കുന്നു",
        pricing: "വിലകൾ",
        stories: "കഥകൾ",
        profile: "പ്രൊഫൈൽ",
      },
      actions: {
        startPlanning: "പ്ലാൻ ആരംഭിക്കുക",
        login: "ലോഗിൻ",
        logout: "ലോഗ് ഔട്ട്",
        buildItinerary: "യാത്ര പദ്ധതി തയ്യാറാക്കുക",
        seeHow: "എങ്ങനെ പ്രവർത്തിക്കുന്നു",
        openItinerary: "യാത്ര പദ്ധതി തുറക്കുക",
      },
      labels: {
        language: "ഭാഷ",
        loading: "ലോഡിംഗ്...",
      },
      home: {
        title: "ഹോം",
        subtitle: "നിങ്ങളുടെ ട്രിപ്പ് വർക്ക്‌സ്‌പേസ് തയ്യാറാണ്.",
      },
      tripPlanner: {
        eyebrow: "ഫ്രീ ട്രിപ്പ് പ്ലാനർ",
        title: "ഡ്രാഫ്റ്റ് യാത്രാ പദ്ധതി തയ്യാറാക്കുക",
        subtitle: "ലക്ഷ്യസ്ഥാനം ദിവസങ്ങളായി വിഭജിച്ച പ്ലാനായി മാറ്റുക.",
        form: {
          destinationLabel: "ലക്ഷ്യസ്ഥാനം",
          destinationPlaceholder: "ഉദാ. Paris, Tokyo, New York",
          daysLabel: "ദിവസങ്ങൾ",
          paceLabel: "വേഗം",
        },
        pace: {
          relaxed: "ശാന്തം",
          balanced: "സമതുലിതം",
          fast: "വേഗത്തിലുള്ള",
        },
        actions: {
          generate: "പ്ലാൻ സൃഷ്ടിക്കുക",
          generating: "സൃഷ്ടിക്കുന്നു...",
          regenerate: "പ്ലാൻ വീണ്ടും സൃഷ്ടിക്കുക",
          regenerateDay: "ദിവസം വീണ്ടും സൃഷ്ടിക്കുക",
          regeneratingDay: "വീണ്ടും സൃഷ്ടിക്കുന്നു...",
          editDay: "ദിവസം എഡിറ്റ് ചെയ്യുക",
          doneEditing: "എഡിറ്റ് പൂർത്തിയായി",
        },
        results: {
          title: "നിങ്ങളുടെ ഡ്രാഫ്റ്റ് യാത്രാ പദ്ധതി",
          summary: "{{destination}}യിലെ {{days}} ദിവസം",
          pace: "വേഗം: {{pace}}",
          meta: "ദിവസം ഏകദേശം {{hours}} മണിക്കൂർ • മൊത്തം {{stops}} ഇടങ്ങൾ",
          focus: "ഫോക്കസ് ഏരിയ: {{area}}",
          dayLabel: "ദിവസം {{day}}",
          totalTime: "മൊത്തം സമയം: {{hours}} മണിക്കൂർ",
          hoursShort: "{{hours}} മണിക്കൂർ",
          itemMeta: "{{hours}} മണിക്കൂർ · {{category}}",
          generated: "ഓഫ്ലൈൻ നിർദ്ദേശങ്ങളിൽ നിന്ന് സൃഷ്ടിച്ചത്.",
          fallback:
            "ഈ ലക്ഷ്യസ്ഥാനം ഡാറ്റാസെറ്റിൽ ഇല്ലാത്തതിനാൽ പൊതുവായ പ്ലാൻ ആണ്.",
        },
        map: {
          title: "മാപ്പ് പ്രിവ്യൂ",
          source: "OpenStreetMap",
          loading: "മാപ്പ് ലോഡ് ചെയ്യുന്നു...",
          error: "മാപ്പ് ലോഡ് ചെയ്യാനായില്ല.",
          noResults: "ഈ ലക്ഷ്യസ്ഥാനത്തിന് മാപ്പ് ലഭ്യമല്ല.",
          open: "മാപ്പ് തുറക്കുക",
          alt: "{{destination}} മാപ്പ്",
        },
        slots: {
          morning: "പ്രഭാതം",
          afternoon: "ഉച്ച",
          evening: "സന്ധ്യ",
        },
        categories: {
          landmark: "പ്രസിദ്ധ സ്ഥലം",
          museum: "മ്യൂസിയം",
          neighborhood: "ഇലാക",
          park: "പാർക്ക്",
          market: "വിപണി",
          experience: "അനുഭവം",
          food: "ഭക്ഷണം",
          nightlife: "നൈറ്റ് ലൈഫ്",
          relax: "ആരാമം",
          viewpoint: "കാഴ്ചപ്പാട്",
        },
        empty: {
          title: "ഒരു ലക്ഷ്യസ്ഥാനം നൽകി തുടങ്ങുക",
          copy: "ഒരു നഗരം നൽകുക, ഞങ്ങൾ ദിവസങ്ങളിലായി പ്ലാൻ തയ്യാറാക്കാം.",
        },
        helper: "ഇപ്പോൾ ലൈവ് ഡാറ്റ ഇല്ല. ഇത് എഡിറ്റ് ചെയ്യാവുന്ന സൗജന്യ ഡ്രാഫ്റ്റ് ആണ്.",
        status: {
          error: "പ്ലാൻ തയ്യാറാക്കാൻ സാധിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക.",
          missingDestination: "ലക്ഷ്യസ്ഥാനം നൽകുക.",
        },
      },
      landing: {
        hero: {
          eyebrow: "യാത്രാ ക്രമീകരണ പ്ലാറ്റ്ഫോം",
          title: "ആദ്യ ആശയം മുതൽ ലളിതമായ യാത്രാ പ്ലാൻ.",
          lead:
            "യാത്രാ പട്ടിക, ബജറ്റ്, ഗ്രൂപ്പ് ചാറ്റുകൾ എല്ലാം ഒരിടത്ത്. Waypoint നിങ്ങളുടെ സംഘത്തെ വേഗത്തിൽ തീരുമാനിക്കാൻ സഹായിക്കുന്നു.",
          primary: "യാത്ര പദ്ധതി തയ്യാറാക്കുക",
          secondary: "എങ്ങനെ പ്രവർത്തിക്കുന്നു",
        },
        stats: [
          { value: "4.9", label: "ശരാശരി ഓർഗനൈസർ റേറ്റിംഗ്" },
          { value: "52k", label: "2025 ൽ ഏകോപിപ്പിച്ച യാത്രകൾ" },
          { value: "12 hrs", label: "ഗ്രൂപ്പിന് ശരാശരി ലാഭിച്ച സമയം" },
        ],
        card: {
          header: "വരാനിരിക്കുന്ന യാത്ര",
          dates: "Apr 18 - Apr 24",
          name: "പോർച്ചുഗൽ തീര യാത്ര",
          travelersConfirmedLabel: "യാത്രികർ സ്ഥിരീകരിച്ചു",
          travelersPendingLabel: "പെൻഡിംഗ്",
          budgetLabel: "ഓരോ യാത്രികന് ബജറ്റ് ലക്ഷ്യം",
          ideasLabel: "സേവ്ഡ് ആശയങ്ങൾ",
          bookedLabel: "ബുക്ക് ചെയ്തത്",
          progress: "പ്ലാനിന്റെ 68% പൂർത്തിയായി",
        },
        features: {
          title: "നിങ്ങളുടെ സംഘത്തിന് വേണ്ട എല്ലാം ഒരിടത്ത്",
          subtitle:
            "സെർജിച്ച ടു-ഡു ലിസ്റ്റ്, കലണ്ടർ, ബജറ്റ് എന്നിവ Waypoint തത്സമയം അപ്ഡേറ്റ് ചെയ്യുന്നു.",
          items: [
            {
              title: "പങ്കിടുന്ന യാത്രാ പട്ടിക",
              copy:
                "ആക്റ്റിവിറ്റികൾ ഡ്രാഗ്-ഡ്രോപ് ചെയ്ത് വോട്ടുചെയ്യുക. മാറ്റങ്ങൾ എല്ലാവർക്കും ഉടൻ എത്തും.",
            },
            {
              title: "സ്മാർട്ട് ബജറ്റ് ട്രാക്കിംഗ്",
              copy:
                "ചെലവുകൾ സ്വയം വിഭജിക്കുക, പരിധി നിശ്ചയിക്കുക, ബാക്കി ഉടൻ കാണുക.",
            },
            {
              title: "ലൈവ് ഗ്രൂപ്പ് അപ്ഡേറ്റുകൾ",
              copy:
                "മെസേജിംഗ്, റിമൈൻഡർ, ചെക്ക്ലിസ്റ്റുകൾ എല്ലാവരെയും ഒരേ പേജിൽ നിലനിർത്തുന്നു.",
            },
            {
              title: "യാത്രാ ടെംപ്ലേറ്റുകൾ",
              copy:
                "വീക്കെൻഡ് യാത്രകൾക്കും റിട്രീറ്റുകൾക്കും മുൻകൂട്ടി തയ്യാറാക്കിയ ടെംപ്ലേറ്റുകൾ.",
            },
            {
              title: "വെൻഡർ മാർക്കറ്റ്പ്ലേസ്",
              copy:
                "വിശ്വാസയോഗ്യമായ പങ്കാളികളിലൂടെ താമസം, യാത്ര, അനുഭവങ്ങൾ ബുക്ക് ചെയ്യുക.",
            },
            {
              title: "ഓഫ്‌ലൈനിൽ ലഭ്യം",
              copy: "ഇന്റർനെറ്റ് ഇല്ലെങ്കിലും പ്ലാൻ ലഭ്യമാക്കാൻ ഡൗൺലോഡ് ചെയ്യാം.",
            },
          ],
        },
        how: {
          title: "Waypoint എങ്ങനെ പ്രവർത്തിക്കുന്നു",
          subtitle: "പ്രചോദനത്തിൽ നിന്ന് സ്ഥിരീകരണമേറ്റു മൂന്ന് ഘട്ടം.",
          steps: [
            {
              title: "നിങ്ങളുടെ യാത്രാ ഹബ് സൃഷ്ടിക്കുക",
              copy:
                "തീയതികൾ ചേർക്കുക, യാത്രികരെ ക്ഷണിക്കുക, ആശയങ്ങൾ ചേർക്കുക.",
            },
            {
              title: "വോട്ടുചെയ്ത് അന്തിമമാക്കുക",
              copy:
                "ഇഷ്ടങ്ങൾ ശേഖരിച്ചു ബുക്കിംഗ് പൂർത്തിയാക്കി ദിനക്രമം തയ്യാറാക്കുക.",
            },
            {
              title: "ഒരുമിച്ച് യാത്ര ചെയ്യുക",
              copy:
                "ലൈവ് അപ്ഡേറ്റുകൾ, മാപ്പുകൾ, സ്ഥിരീകരണം എല്ലാം ഒരൊറ്റ പട്ടികയിൽ.",
            },
          ],
        },
        demo: {
          title: "നിങ്ങളുടെ യാത്രാ ടൈംലൈൻ ഒരു നേർക്കാഴ്ചയിൽ",
          subtitle:
            "ദൈനംദിന അജണ്ട, ട്രാൻസിറ്റ് സമയങ്ങൾ, ഗ്രൂപ്പ് ചെക്ക്-ഇൻ എന്നിവ Waypoint കാണിക്കുന്നു.",
          checklist: [
            "ആഗമന സമയംയും യാത്രയും സ്വയം ചേർക്കുക.",
            "ഓരോ ദിവസത്തെയും മീറ്റിംഗ് പോയിന്റുകൾ പിന് ചെയ്യുക.",
            "ഗ്രൂപ്പിന് പുഷ് റിമൈൻഡർ സജ്ജമാക്കുക.",
          ],
          timeline: [
            {
              time: "8:00 AM",
              title: "ലിസ്ബണിൽ കൂടിക്കാഴ്ച",
              detail: "അവെനിഡയിൽ പിക്കപ്പ്, ബ്രേക്ക്ഫാസ്റ്റ്.",
            },
            {
              time: "11:30 AM",
              title: "തീരത്തേക്ക് ഡ്രൈവ്",
              detail: "വാൻ ബുക്ക് ചെയ്തു, ലഗേജ് തയ്യാറായി.",
            },
            {
              time: "3:00 PM",
              title: "ചെക്ക്-ഇൻ",
              detail: "ഹോട്ടൽ ബഹിയ, റൂമുകൾ റെഡി.",
            },
            {
              time: "7:30 PM",
              title: "സ്വാഗത ഡിന്നർ",
              detail: "ഗ്രൂപ്പ് ടേബിൾ റിസർവ് ചെയ്തു.",
            },
          ],
        },
        stories: {
          title: "ടീമുകളും സുഹൃദ് സംഘങ്ങളും Waypoint വിശ്വസിക്കുന്നു",
          subtitle:
            "ഓഫ്‌സൈറ്റ് മുതൽ ബാച്ചിലർ പാർട്ടി വരെ, എല്ലാം ഒരു സത്യസ്രോതസിൽ.",
          testimonials: [
            {
              quote:
                "24 പേരുടെ റിട്രീറ്റ് പ്ലാൻ ചെയ്തു, ചിലവുകൾ ഒരിക്കലും കൈവിട്ടില്ല. പങ്കിട്ട യാത്രാ പട്ടിക എല്ലാവരെയും ഒരുമിപ്പിച്ചു.",
              name: "Maya R.",
              title: "People Operations, Northwind",
            },
            {
              quote:
                "Waypoint കൊണ്ട് ആക്റ്റിവിറ്റികളിൽ വോട്ട് ചെയ്യുന്നത് ലളിതമായി. മണിക്കൂറുകൾ ലാഭിച്ചു.",
              name: "Jordan P.",
              title: "Travel organizer, Atlas Crew",
            },
          ],
        },
        pricing: {
          title: "ഓരോ യാത്രയ്ക്കും ലളിതമായ വില",
          subtitle: "ഇപ്പോൾ സൗജന്യമായി തുടങ്ങുക, ആവശ്യമെങ്കിൽ അപ്ഗ്രേഡ് ചെയ്യുക.",
          tiers: [
            {
              name: "സ്റ്റാർട്ടർ",
              price: "$0",
              note: "വീക്കെൻഡ് യാത്രകൾക്ക് അനുയോജ്യം.",
              features: ["ഒരു ആക്ടീവ് യാത്ര", "ഗ്രൂപ്പ് വോട്ടിംഗ്", "ബേസിക് ബജറ്റ് ട്രാക്കിംഗ്"],
              cta: "തുടങ്ങുക",
              variant: "ghost",
            },
            {
              name: "കലെക്ടീവ്",
              price: "$12",
              note: "ഓർഗനൈസറിന് പ്രതിമാസം.",
              features: [
                "പരിമിതിയില്ലാത്ത യാത്രകൾ",
                "ലൈവ് മെസ്സേജിംഗ്",
                "പങ്കിട്ട ടെംപ്ലേറ്റുകൾ",
                "ഓട്ടോമേറ്റഡ് റിമൈൻഡർ",
              ],
              cta: "ഫ്രീ ട്രയൽ ആരംഭിക്കുക",
              variant: "primary",
              featured: true,
              badge: "മികച്ചത്",
            },
            {
              name: "എന്റർപ്രൈസ്",
              price: "Custom",
              note: "വലിയ ട്രാവൽ ടീമുകൾക്കായി.",
              features: ["ഡെഡിക്കേറ്റഡ് കോൺസിയർജ്", "അഡ്വാൻസ്ഡ് റിപ്പോർട്ടിംഗ്", "അഡ്മിൻ നിയന്ത്രണം"],
              cta: "സെയിൽസുമായി ബന്ധപ്പെടുക",
              variant: "ghost",
            },
          ],
        },
        cta: {
          title: "നിങ്ങളുടെ അടുത്ത യാത്രയിലേക്ക് തയ്യാറാണോ?",
          subtitle:
            "മിനിറ്റുകൾക്കകം ട്രിപ്പ് ഹബ് സൃഷ്ടിച്ച് സംഘത്തെ ക്ഷണിക്കുക.",
          label: "വർക്ക് ഇമെയിൽ",
          placeholder: "you@team.com",
          button: "പ്ലാൻ ആരംഭിക്കുക",
          note: "14 ദിവസത്തെ ഫ്രീ ട്രയൽ. ക്രെഡിറ്റ് കാർഡ് ആവശ്യമില്ല.",
          helper: "പൂർണ്ണ അക്കൗണ്ട് വേണമോ?",
          helperLink: "ഇപ്പോൾ സൃഷ്ടിക്കുക",
        },
      },
      footer: {
        blurb: "ഗ്രൂപ്പ് യാത്രകൾ ഒന്നു ചേർന്ന് ഓർഗനൈസ് ചെയ്യാനുള്ള സ്ഥലം.",
        product: "ഉൽപ്പന്നം",
        company: "കമ്പനി",
        resources: "വിഭവങ്ങൾ",
        links: {
          features: "സവിശേഷതകൾ",
          pricing: "വിലകൾ",
          demo: "ഡെമോ",
          about: "ഞങ്ങളെ കുറിച്ച്",
          careers: "കരിയർ",
          contact: "ബന്ധപ്പെടുക",
          support: "സപ്പോർട്ട്",
          guides: "ഗൈഡുകൾ",
          privacy: "സ്വകാര്യത",
        },
        bottom: {
          copyright: "Copyright 2026 Waypoint. All rights reserved.",
          terms: "നിബന്ധനകൾ",
          privacy: "സ്വകാര്യത",
          security: "സുരക്ഷ",
        },
      },
      auth: {
        messages: {
          required: "ഇമെയിലും പാസ്‍വേഡും ആവശ്യമാണ്.",
          passwordMismatch: "പാസ്‍വേഡുകൾ ഒത്തുവരുന്നില്ല.",
          loginSuccess: "ലോഗിൻ വിജയിച്ചു.",
          registerSuccess: "അക്കൗണ്ട് സൃഷ്ടിച്ചു. ലോഗിൻ ചെയ്യുക.",
          profileHint: "അക്കൗണ്ട് സൃഷ്ടിച്ചു. പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക.",
        },
        login: {
          eyebrow: "സ്വാഗതം",
          title: "പ്ലാൻ തുടരാൻ ലോഗിൻ ചെയ്യുക.",
          subtitle:
            "പങ്കിട്ട യാത്രാ പട്ടിക, ബജറ്റ്, ഗ്രൂപ്പ് അപ്ഡേറ്റുകൾ ഒരിടത്ത്.",
          list: [
            "നിങ്ങളുടെ സംഘം അവസാനിപ്പിച്ച സ്ഥലത്ത് നിന്ന് തുടരുക.",
            "തത്സമയ അപ്ഡേറ്റുകളും ബുക്കിംഗ് നിലയും കാണുക.",
            "ഓട്ടോമേറ്റഡ് റിമൈൻഡറുകൾ ഉപയോഗിച്ച് ഒരുമിപ്പിക്കുക.",
          ],
          formTitle: "ലോഗിൻ",
          formSubtitle: "രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ ഉപയോഗിക്കുക.",
          emailLabel: "ഇമെയിൽ",
          passwordLabel: "പാസ്‌വേഡ്",
          button: "ലോഗിൻ",
          loading: "സൈൻ ഇൻ ചെയ്യുന്നു...",
          footer: "Waypoint-ലേക്ക് പുതുതാണോ?",
          footerLink: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
          signedInAs: "{{email}} ആയി ലോഗിൻ ചെയ്തു",
          profileCta: "പ്രൊഫൈലിലേക്ക് പോകുക",
        },
        register: {
          eyebrow: "പ്ലാൻ ആരംഭിക്കുക",
          title: "നിങ്ങളുടെ Waypoint അക്കൗണ്ട് സൃഷ്ടിക്കുക.",
          subtitle:
            "ട്രിപ്പ് ഹബ് സജ്ജമാക്കി യാത്രികരെ ക്ഷണിച്ച് പ്ലാൻ സിങ്ക് ചെയ്യുക.",
          list: [
            "യാത്രാ പട്ടിക, ബജറ്റ്, ചെക്ക്ലിസ്റ്റുകൾ ക്രമീകരിക്കുക.",
            "തത്സമയ അപ്ഡേറ്റുകൾ കൊണ്ട് എല്ലാവരെയും ഒത്തുചേർക്കുക.",
            "ഐഡിയയിൽ നിന്ന് ബുക്കിങ്ങിലേക്ക് ഒരു പ്ലാറ്റ്ഫോമിൽ.",
          ],
          formTitle: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
          formSubtitle: "തുടങ്ങാൻ നിങ്ങളുടെ വർക്ക് ഇമെയിൽ ഉപയോഗിക്കുക.",
          emailLabel: "ഇമെയിൽ",
          passwordLabel: "പാസ്‌വേഡ്",
          confirmLabel: "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
          button: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
          loading: "അക്കൗണ്ട് സൃഷ്ടിക്കുന്നു...",
          footer: "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?",
          footerLink: "ലോഗിൻ",
          profileCta: "പ്രൊഫൈൽ പൂര്‍ത്തിയാക്കുക",
        },
      },
      profile: {
        title: "പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ",
        subtitle: "ബന്ധപ്പെടൽ വിവരങ്ങളും മുൻഗണനകളും ഭാഷയും അപ്ഡേറ്റ് ചെയ്യുക.",
        intro: "യാത്രാ അപ്ഡേറ്റുകൾ ശരിയായ ആളുകളിലെത്താൻ പ്രൊഫൈൽ പുതുക്കി വെക്കൂ.",
        empty: {
          title: "പ്രൊഫൈൽ നിയന്ത്രിക്കാൻ ലോഗിൻ ചെയ്യുക",
          copy:
            "ബന്ധപ്പെടൽ വിവരങ്ങൾ, കറൻസി, ഭാഷ മുൻഗണനകൾ അപ്ഡേറ്റ് ചെയ്യാൻ ലോഗിൻ ചെയ്യൂ.",
          button: "ലോഗിൻ",
        },
        form: {
          email: "ഇമെയിൽ",
          phone: "ഫോൺ നമ്പർ",
          country: "രാജ്യം",
          language: "ഭാഷ",
          currency: "കറൻസി",
        },
        placeholders: {
          email: "you@team.com",
          phone: "+1 555 000 0000",
          country: "രാജ്യം തിരഞ്ഞെടുക്കുക",
        },
        actions: {
          save: "മാറ്റങ്ങൾ സംരക്ഷിക്കുക",
          saving: "സംരക്ഷിക്കുന്നു...",
        },
        status: {
          saved: "പ്രൊഫൈൽ വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു.",
          loadError: "പ്രൊഫൈൽ ലോഡ് ചെയ്യാനായില്ല.",
          saveError: "മാറ്റങ്ങൾ സംരക്ഷിക്കാനായില്ല.",
        },
      },
      languages: {
        en: "ഇംഗ്ലീഷ്",
        hi: "ഹിന്ദി",
        ml: "മലയാളം",
        ar: "അറബി",
        es: "സ്പാനിഷ്",
        de: "ജർമ്മൻ",
      },
    },
  },
  ar: {
    translation: {
      appName: "Waypoint",
      nav: {
        home: "الرئيسية",
        features: "الميزات",
        how: "كيف يعمل",
        pricing: "الأسعار",
        stories: "القصص",
        profile: "الملف الشخصي",
      },
      actions: {
        startPlanning: "ابدأ التخطيط",
        login: "تسجيل الدخول",
        logout: "تسجيل الخروج",
        buildItinerary: "أنشئ خط سيرك",
        seeHow: "اطلع على طريقة العمل",
        openItinerary: "افتح خط السير",
      },
      labels: {
        language: "اللغة",
        loading: "جار التحميل...",
      },
      home: {
        title: "الرئيسية",
        subtitle: "مساحة عمل رحلاتك جاهزة.",
      },
      tripPlanner: {
        eyebrow: "مخطط رحلات مجاني",
        title: "أنشئ خطة رحلة أولية",
        subtitle: "حوّل الوجهة إلى خطة يومية قابلة للتعديل.",
        form: {
          destinationLabel: "الوجهة",
          destinationPlaceholder: "مثال: باريس، طوكيو، نيويورك",
          daysLabel: "الأيام",
          paceLabel: "الوتيرة",
        },
        pace: {
          relaxed: "هادئة",
          balanced: "متوازنة",
          fast: "سريعة",
        },
        actions: {
          generate: "إنشاء الخطة",
          generating: "جارٍ الإنشاء...",
          regenerate: "إعادة إنشاء الخطة",
          regenerateDay: "إعادة إنشاء اليوم",
          regeneratingDay: "جارٍ إعادة الإنشاء...",
          editDay: "تعديل اليوم",
          doneEditing: "إنهاء التعديل",
        },
        results: {
          title: "مسودة خط سير رحلتك",
          summary: "{{days}} أيام في {{destination}}",
          pace: "الوتيرة: {{pace}}",
          meta: "حوالي {{hours}} ساعة/يوم • {{stops}} محطة إجمالاً",
          focus: "منطقة التركيز: {{area}}",
          dayLabel: "اليوم {{day}}",
          totalTime: "المدة الإجمالية: {{hours}} ساعة",
          hoursShort: "{{hours}} ساعة",
          itemMeta: "{{hours}} ساعة · {{category}}",
          generated: "تم إنشاؤها من اقتراحات غير متصلة.",
          fallback: "نعرض خطة عامة لأن الوجهة غير موجودة في بياناتنا الأولية.",
        },
        map: {
          title: "معاينة الخريطة",
          source: "OpenStreetMap",
          loading: "جارٍ تحميل الخريطة...",
          error: "تعذر تحميل الخريطة.",
          noResults: "لم يتم العثور على خريطة لهذه الوجهة.",
          open: "افتح الخريطة",
          alt: "خريطة {{destination}}",
        },
        slots: {
          morning: "صباحًا",
          afternoon: "بعد الظهر",
          evening: "مساءً",
        },
        categories: {
          landmark: "معلم",
          museum: "متحف",
          neighborhood: "حي",
          park: "حديقة",
          market: "سوق",
          experience: "تجربة",
          food: "طعام",
          nightlife: "حياة ليلية",
          relax: "استرخاء",
          viewpoint: "منظر",
        },
        empty: {
          title: "ابدأ بوجهة",
          copy: "أدخل مدينة وسننشئ خطة يومية لك.",
        },
        helper: "لا توجد بيانات مباشرة بعد. هذه مسودة مجانية يمكنك تعديلها.",
        status: {
          error: "تعذر إنشاء الخطة. حاول مرة أخرى.",
          missingDestination: "يرجى إدخال الوجهة.",
        },
      },
      landing: {
        hero: {
          eyebrow: "منصة تنظيم الرحلات",
          title: "خطط لرحلاتك بسهولة منذ الفكرة الأولى.",
          lead:
            "اجمع خطط الرحلة والميزانيات ودردشات المجموعة في مكان واحد. يساعدك Waypoint على اتخاذ القرارات بسرعة.",
          primary: "أنشئ خط سيرك",
          secondary: "اطلع على طريقة العمل",
        },
        stats: [
          { value: "4.9", label: "متوسط تقييم المنظمين" },
          { value: "52k", label: "رحلات منسقة في 2025" },
          { value: "12 hrs", label: "متوسط الوقت الموفر لكل مجموعة" },
        ],
        card: {
          header: "الرحلة القادمة",
          dates: "Apr 18 - Apr 24",
          name: "رحلة ساحل البرتغال",
          travelersConfirmedLabel: "مسافرون مؤكدون",
          travelersPendingLabel: "قيد الانتظار",
          budgetLabel: "هدف الميزانية لكل مسافر",
          ideasLabel: "أفكار محفوظة",
          bookedLabel: "تم الحجز",
          progress: "تم إنجاز 68% من الخطة",
        },
        features: {
          title: "كل ما يحتاجه فريقك للتحرك بسرعة",
          subtitle:
            "Waypoint ينظم القرارات عبر قوائم المهام والتقويمات والميزانيات المحدثة لحظيًا.",
          items: [
            {
              title: "خط سير مشترك",
              copy:
                "اسحب وأفلت الأنشطة وصوت عليها. كل تغيير يصل للجميع فورًا.",
            },
            {
              title: "تتبع ميزانية ذكي",
              copy:
                "قسّم التكاليف تلقائيًا، حدد الحدود، وشاهد المستحقات سريعًا.",
            },
            {
              title: "تحديثات جماعية مباشرة",
              copy:
                "رسائل مدمجة وتذكيرات وقوائم تحقق تُبقي الجميع على نفس الصفحة.",
            },
            {
              title: "قوالب رحلات",
              copy:
                "ابدأ بقوالب جاهزة لعطلات نهاية الأسبوع أو الرحلات الدولية.",
            },
            {
              title: "سوق الموردين",
              copy:
                "احجز الإقامات والتنقلات والتجارب من شركاء موثوقين.",
            },
            {
              title: "وصول دون اتصال",
              copy: "حمّل خطتك النهائية لتكون جاهزة حتى دون إنترنت.",
            },
          ],
        },
        how: {
          title: "كيف يعمل Waypoint",
          subtitle: "انتقل من الإلهام إلى التأكيد بثلاث خطوات مركزة.",
          steps: [
            {
              title: "أنشئ مركز رحلتك",
              copy:
                "أضف التواريخ وادع المسافرين وأضف الأفكار من أي جهاز.",
            },
            {
              title: "صوّت واعتمد",
              copy:
                "اجمع التفضيلات وأكد الحجوزات وأنشئ الجدول اليومي تلقائيًا.",
            },
            {
              title: "سافروا معًا",
              copy:
                "شارك التحديثات والخرائط والتأكيدات من خط سير واحد.",
            },
          ],
        },
        demo: {
          title: "اطلع على جدول رحلتك بنظرة واحدة",
          subtitle:
            "يعرض Waypoint الجداول اليومية ونوافذ التنقل وتسجيلات الوصول الجماعية.",
          checklist: [
            "مواءمة أوقات الوصول والتنقل تلقائيًا.",
            "تثبيت نقاط اللقاء لكل يوم.",
            "تعيين تذكيرات فورية للمجموعة.",
          ],
          timeline: [
            {
              time: "8:00 AM",
              title: "اللقاء في لشبونة",
              detail: "استلام وإفطار في أفينيدا.",
            },
            {
              time: "11:30 AM",
              title: "رحلة ساحلية",
              detail: "تم حجز الفان وتجهيز الحقائب.",
            },
            {
              time: "3:00 PM",
              title: "تسجيل الدخول",
              detail: "فندق باهيا، الغرف جاهزة.",
            },
            {
              time: "7:30 PM",
              title: "عشاء ترحيبي",
              detail: "تم حجز طاولة للمجموعة.",
            },
          ],
        },
        stories: {
          title: "الفرق ومجموعات الأصدقاء تثق بـ Waypoint",
          subtitle:
            "من رحلات العمل إلى حفلات الأصدقاء، يعتمد المنظمون على مصدر واحد للحقيقة.",
          testimonials: [
            {
              quote:
                "خططنا لرحلة عمل لـ 24 شخصًا ولم نفقد السيطرة على الميزانية أبدًا. خط السير المشترك أبقى الجميع على نفس الصفحة.",
              name: "Maya R.",
              title: "People Operations, Northwind",
            },
            {
              quote:
                "Waypoint سهّل التصويت على الأنشطة. وفرنا ساعات من النقاشات.",
              name: "Jordan P.",
              title: "Travel organizer, Atlas Crew",
            },
          ],
        },
        pricing: {
          title: "أسعار بسيطة لكل رحلة",
          subtitle: "ابدأ مجانًا ثم قم بالترقية عند الحاجة لتنسيق أعمق.",
          tiers: [
            {
              name: "مبتدئ",
              price: "$0",
              note: "مثالي لعطلات نهاية الأسبوع.",
              features: ["رحلة واحدة نشطة", "تصويت جماعي", "تتبع ميزانية أساسي"],
              cta: "ابدأ",
              variant: "ghost",
            },
            {
              name: "جماعي",
              price: "$12",
              note: "لكل منظم شهريًا.",
              features: [
                "رحلات غير محدودة",
                "مراسلة مباشرة",
                "قوالب مشتركة",
                "تذكيرات تلقائية",
              ],
              cta: "ابدأ التجربة المجانية",
              variant: "primary",
              featured: true,
              badge: "الأكثر شيوعًا",
            },
            {
              name: "مؤسسي",
              price: "مخصص",
              note: "مصمم لفرق السفر الكبيرة.",
              features: ["كونسيرج مخصص", "تقارير متقدمة", "تحكم إداري"],
              cta: "تواصل مع المبيعات",
              variant: "ghost",
            },
          ],
        },
        cta: {
          title: "هل أنت مستعد لتنظيم رحلتك القادمة؟",
          subtitle:
            "أنشئ مركز رحلتك في دقائق وادعُ فريقك لبدء التخطيط.",
          label: "بريد العمل",
          placeholder: "you@team.com",
          button: "ابدأ التخطيط",
          note: "تجربة مجانية لمدة 14 يومًا. بدون بطاقة ائتمان.",
          helper: "هل تريد حسابًا كاملًا؟",
          helperLink: "أنشئه الآن",
        },
      },
      footer: {
        blurb:
          "مساحة مشتركة لتنظيم وحجز وتجربة رحلات جماعية لا تُنسى.",
        product: "المنتج",
        company: "الشركة",
        resources: "الموارد",
        links: {
          features: "الميزات",
          pricing: "الأسعار",
          demo: "عرض توضيحي",
          about: "حول",
          careers: "الوظائف",
          contact: "تواصل",
          support: "الدعم",
          guides: "الأدلة",
          privacy: "الخصوصية",
        },
        bottom: {
          copyright: "Copyright 2026 Waypoint. All rights reserved.",
          terms: "الشروط",
          privacy: "الخصوصية",
          security: "الأمان",
        },
      },
      auth: {
        messages: {
          required: "البريد الإلكتروني وكلمة المرور مطلوبة.",
          passwordMismatch: "كلمتا المرور غير متطابقتين.",
          loginSuccess: "تم تسجيل الدخول بنجاح.",
          registerSuccess: "تم إنشاء الحساب. يمكنك تسجيل الدخول الآن.",
          profileHint: "تم إنشاء الحساب. حدّث ملفك الشخصي الآن.",
        },
        login: {
          eyebrow: "مرحبًا بعودتك",
          title: "سجل الدخول لمواصلة التخطيط.",
          subtitle: "اطلع على خططك المشتركة والميزانيات والتحديثات في مكان واحد.",
          list: [
            "تابع من حيث توقف فريقك.",
            "شاهد التحديثات وحالة الحجز في الوقت الفعلي.",
            "ابقَ متوافقًا عبر التذكيرات التلقائية.",
          ],
          formTitle: "تسجيل الدخول",
          formSubtitle: "استخدم البريد الإلكتروني المسجل.",
          emailLabel: "البريد الإلكتروني",
          passwordLabel: "كلمة المرور",
          button: "تسجيل الدخول",
          loading: "جار تسجيل الدخول...",
          footer: "جديد على Waypoint؟",
          footerLink: "أنشئ حسابًا",
          signedInAs: "تم تسجيل الدخول باسم {{email}}",
          profileCta: "اذهب إلى الملف الشخصي",
        },
        register: {
          eyebrow: "ابدأ التخطيط",
          title: "أنشئ حساب Waypoint.",
          subtitle: "أنشئ مركز رحلتك وادعُ المسافرين للحفاظ على التنسيق.",
          list: [
            "نظم خطط الرحلات والميزانيات وقوائم التحقق.",
            "حافظ على توافق الجميع مع التحديثات الفورية.",
            "انتقل من الفكرة إلى الحجز في مساحة واحدة.",
          ],
          formTitle: "إنشاء حساب",
          formSubtitle: "استخدم بريد العمل للبدء.",
          emailLabel: "البريد الإلكتروني",
          passwordLabel: "كلمة المرور",
          confirmLabel: "تأكيد كلمة المرور",
          button: "إنشاء حساب",
          loading: "جار إنشاء الحساب...",
          footer: "هل لديك حساب بالفعل؟",
          footerLink: "تسجيل الدخول",
          profileCta: "أكمل إعداد الملف الشخصي",
        },
      },
      profile: {
        title: "إعدادات الملف الشخصي",
        subtitle: "حدّث بيانات الاتصال والتفضيلات واللغة.",
        intro: "حافظ على ملفك الشخصي محدثًا حتى تصل التحديثات للجميع.",
        empty: {
          title: "سجل الدخول لإدارة ملفك الشخصي",
          copy:
            "سجل الدخول لتحديث بيانات الاتصال والعملة واللغة.",
          button: "تسجيل الدخول",
        },
        form: {
          email: "البريد الإلكتروني",
          phone: "رقم الهاتف",
          country: "الدولة",
          language: "اللغة",
          currency: "العملة",
        },
        placeholders: {
          email: "you@team.com",
          phone: "+1 555 000 0000",
          country: "اختر الدولة",
        },
        actions: {
          save: "حفظ التغييرات",
          saving: "جار الحفظ...",
        },
        status: {
          saved: "تم تحديث الملف الشخصي بنجاح.",
          loadError: "تعذر تحميل الملف الشخصي.",
          saveError: "تعذر حفظ التغييرات.",
        },
      },
      languages: {
        en: "الإنجليزية",
        hi: "الهندية",
        ml: "المالايالامية",
        ar: "العربية",
        es: "الإسبانية",
        de: "الألمانية",
      },
    },
  },
  es: {
    translation: {
      appName: "Waypoint",
      nav: {
        home: "Inicio",
        features: "Funciones",
        how: "Cómo funciona",
        pricing: "Precios",
        stories: "Historias",
        profile: "Perfil",
      },
      actions: {
        startPlanning: "Empieza a planificar",
        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        buildItinerary: "Crea tu itinerario",
        seeHow: "Ver cómo funciona",
        openItinerary: "Abrir itinerario",
      },
      labels: {
        language: "Idioma",
        loading: "Cargando...",
      },
      home: {
        title: "Inicio",
        subtitle: "Tu espacio de viajes está listo.",
      },
      tripPlanner: {
        eyebrow: "Planificador gratuito",
        title: "Crea un plan de viaje",
        subtitle: "Convierte un destino en un plan diario editable.",
        form: {
          destinationLabel: "Destino",
          destinationPlaceholder: "p. ej. París, Tokio, Nueva York",
          daysLabel: "Días",
          paceLabel: "Ritmo",
        },
        pace: {
          relaxed: "Relajado",
          balanced: "Equilibrado",
          fast: "Rápido",
        },
        actions: {
          generate: "Generar plan",
          generating: "Generando...",
          regenerate: "Regenerar plan",
          regenerateDay: "Regenerar día",
          regeneratingDay: "Regenerando...",
          editDay: "Editar día",
          doneEditing: "Terminar edición",
        },
        results: {
          title: "Tu itinerario preliminar",
          summary: "{{days}} días en {{destination}}",
          pace: "Ritmo: {{pace}}",
          meta: "Aprox. {{hours}} h/día • {{stops}} paradas en total",
          focus: "Zona principal: {{area}}",
          dayLabel: "Día {{day}}",
          totalTime: "Tiempo total: {{hours}} h",
          hoursShort: "{{hours}} h",
          itemMeta: "{{hours}} h · {{category}}",
          generated: "Generado a partir de sugerencias sin conexión.",
          fallback:
            "Mostramos un plan general porque este destino aún no está en nuestro conjunto inicial.",
        },
        map: {
          title: "Vista previa del mapa",
          source: "OpenStreetMap",
          loading: "Cargando mapa...",
          error: "No pudimos cargar el mapa.",
          noResults: "No se encontró un mapa para este destino.",
          open: "Abrir mapa",
          alt: "Mapa de {{destination}}",
        },
        slots: {
          morning: "Mañana",
          afternoon: "Tarde",
          evening: "Noche",
        },
        categories: {
          landmark: "Monumento",
          museum: "Museo",
          neighborhood: "Barrio",
          park: "Parque",
          market: "Mercado",
          experience: "Experiencia",
          food: "Comida",
          nightlife: "Vida nocturna",
          relax: "Relax",
          viewpoint: "Mirador",
        },
        empty: {
          title: "Empieza con un destino",
          copy: "Ingresa una ciudad y crearemos un plan diario para ti.",
        },
        helper: "Aún no hay datos en vivo. Este es un borrador gratuito editable.",
        status: {
          error: "No pudimos crear el plan. Inténtalo de nuevo.",
          missingDestination: "Por favor ingresa un destino.",
        },
      },
      landing: {
        hero: {
          eyebrow: "Plataforma de organización de viajes",
          title: "Planifica viajes sin esfuerzo desde la primera idea.",
          lead:
            "Itinerarios, presupuestos y chats de grupo en un solo lugar. Waypoint ayuda a tu equipo a decidir rápido.",
          primary: "Crea tu itinerario",
          secondary: "Ver cómo funciona",
        },
        stats: [
          { value: "4.9", label: "Calificación media de organizadores" },
          { value: "52k", label: "Viajes coordinados en 2025" },
          { value: "12 hrs", label: "Tiempo ahorrado por grupo" },
        ],
        card: {
          header: "Próximo viaje",
          dates: "Apr 18 - Apr 24",
          name: "Escapada costera por Portugal",
          travelersConfirmedLabel: "viajeros confirmados",
          travelersPendingLabel: "pendientes",
          budgetLabel: "meta de presupuesto por viajero",
          ideasLabel: "ideas guardadas",
          bookedLabel: "reservadas",
          progress: "El 68% del plan está finalizado",
        },
        features: {
          title: "Todo lo que tu grupo necesita para avanzar rápido",
          subtitle:
            "Waypoint organiza decisiones con listas, calendarios y presupuestos en tiempo real.",
          items: [
            {
              title: "Itinerario compartido",
              copy:
                "Arrastra, suelta y vota actividades. Cada cambio se actualiza al instante.",
            },
            {
              title: "Control de presupuesto inteligente",
              copy:
                "Divide gastos automáticamente, fija límites y ve pendientes al instante.",
            },
            {
              title: "Actualizaciones en vivo",
              copy:
                "Mensajes, recordatorios y listas mantienen a todos alineados.",
            },
            {
              title: "Plantillas de viaje",
              copy:
                "Empieza con plantillas para escapadas o tours internacionales.",
            },
            {
              title: "Marketplace de proveedores",
              copy:
                "Reserva estancias, transporte y experiencias con socios confiables.",
            },
            {
              title: "Acceso sin conexión",
              copy:
                "Descarga el plan final para tenerlo disponible sin señal.",
            },
          ],
        },
        how: {
          title: "Cómo funciona Waypoint",
          subtitle: "De la inspiración a la confirmación en tres pasos.",
          steps: [
            {
              title: "Crea tu centro de viaje",
              copy:
                "Añade fechas, invita viajeros y agrega ideas desde cualquier dispositivo.",
            },
            {
              title: "Vota y finaliza",
              copy:
                "Recoge preferencias, confirma reservas y crea el plan diario automáticamente.",
            },
            {
              title: "Viajen juntos",
              copy:
                "Comparte actualizaciones, mapas y confirmaciones desde un solo itinerario.",
            },
          ],
        },
        demo: {
          title: "Ve tu cronograma de viaje de un vistazo",
          subtitle:
            "Waypoint muestra agendas diarias, ventanas de traslado y check-ins.",
          checklist: [
            "Alinea horarios de llegada y transporte automáticamente.",
            "Fija puntos de encuentro para cada día.",
            "Configura recordatorios para el grupo.",
          ],
          timeline: [
            {
              time: "8:00 AM",
              title: "Encuentro en Lisboa",
              detail: "Recogida y desayuno en Avenida.",
            },
            {
              time: "11:30 AM",
              title: "Ruta costera",
              detail: "Van reservada, equipaje listo.",
            },
            {
              time: "3:00 PM",
              title: "Check-in",
              detail: "Hotel Bahia, habitaciones listas.",
            },
            {
              time: "7:30 PM",
              title: "Cena de bienvenida",
              detail: "Mesa reservada para el grupo.",
            },
          ],
        },
        stories: {
          title: "Equipos y amigos confían en Waypoint",
          subtitle:
            "De retiros a fiestas, los organizadores confían en una fuente única.",
          testimonials: [
            {
              quote:
                "Planificamos un retiro de 24 personas y nunca perdimos el control del presupuesto. El itinerario compartido nos alineó.",
              name: "Maya R.",
              title: "People Operations, Northwind",
            },
            {
              quote:
                "Waypoint facilitó la votación de actividades. Ahorramos horas de ida y vuelta.",
              name: "Jordan P.",
              title: "Travel organizer, Atlas Crew",
            },
          ],
        },
        pricing: {
          title: "Precios simples para cada viaje",
          subtitle: "Empieza gratis y mejora cuando necesites más coordinación.",
          tiers: [
            {
              name: "Inicial",
              price: "$0",
              note: "Perfecto para escapadas de fin de semana.",
              features: [
                "Un viaje activo",
                "Votación de grupo",
                "Control de presupuesto básico",
              ],
              cta: "Comenzar",
              variant: "ghost",
            },
            {
              name: "Colectivo",
              price: "$12",
              note: "Por organizador al mes.",
              features: [
                "Viajes ilimitados",
                "Mensajería en vivo",
                "Plantillas compartidas",
                "Recordatorios automáticos",
              ],
              cta: "Iniciar prueba gratis",
              variant: "primary",
              featured: true,
              badge: "Más popular",
            },
            {
              name: "Empresarial",
              price: "Personalizado",
              note: "Creado para equipos de viaje grandes.",
              features: [
                "Concierge dedicado",
                "Informes avanzados",
                "Controles de administración",
              ],
              cta: "Contactar ventas",
              variant: "ghost",
            },
          ],
        },
        cta: {
          title: "¿Listo para organizar tu próximo viaje?",
          subtitle:
            "Crea tu centro de viaje en minutos e invita a tu grupo a planificar.",
          label: "Correo de trabajo",
          placeholder: "you@team.com",
          button: "Empieza a planificar",
          note: "Prueba gratuita de 14 días. Sin tarjeta de crédito.",
          helper: "¿Quieres una cuenta completa?",
          helperLink: "Crear ahora",
        },
      },
      footer: {
        blurb:
          "Un espacio compartido para organizar, reservar y disfrutar viajes en grupo.",
        product: "Producto",
        company: "Compañía",
        resources: "Recursos",
        links: {
          features: "Funciones",
          pricing: "Precios",
          demo: "Demo",
          about: "Acerca de",
          careers: "Carreras",
          contact: "Contacto",
          support: "Soporte",
          guides: "Guías",
          privacy: "Privacidad",
        },
        bottom: {
          copyright: "Copyright 2026 Waypoint. All rights reserved.",
          terms: "Términos",
          privacy: "Privacidad",
          security: "Seguridad",
        },
      },
      auth: {
        messages: {
          required: "El correo y la contraseña son obligatorios.",
          passwordMismatch: "Las contraseñas no coinciden.",
          loginSuccess: "Inicio de sesión exitoso.",
          registerSuccess: "Cuenta creada. Ya puedes iniciar sesión.",
          profileHint: "Cuenta creada. Actualiza tu perfil.",
        },
        login: {
          eyebrow: "Bienvenido de vuelta",
          title: "Inicia sesión para seguir planificando.",
          subtitle:
            "Accede a tus itinerarios compartidos, presupuestos y actualizaciones.",
          list: [
            "Retoma justo donde lo dejó tu grupo.",
            "Consulta actualizaciones en tiempo real y reservas.",
            "Mantente alineado con recordatorios automáticos.",
          ],
          formTitle: "Iniciar sesión",
          formSubtitle: "Usa el correo con el que te registraste.",
          emailLabel: "Correo",
          passwordLabel: "Contraseña",
          button: "Iniciar sesión",
          loading: "Iniciando...",
          footer: "¿Nuevo en Waypoint?",
          footerLink: "Crear cuenta",
          signedInAs: "Has iniciado sesión como {{email}}",
          profileCta: "Ir al perfil",
        },
        register: {
          eyebrow: "Empieza a planificar",
          title: "Crea tu cuenta Waypoint.",
          subtitle:
            "Configura tu centro de viaje, invita viajeros y mantén todo sincronizado.",
          list: [
            "Organiza itinerarios, presupuestos y listas.",
            "Alinea a todos con actualizaciones en tiempo real.",
            "Pasa de la idea a la reserva en un solo lugar.",
          ],
          formTitle: "Crear cuenta",
          formSubtitle: "Usa tu correo de trabajo para empezar.",
          emailLabel: "Correo",
          passwordLabel: "Contraseña",
          confirmLabel: "Confirmar contraseña",
          button: "Crear cuenta",
          loading: "Creando cuenta...",
          footer: "¿Ya tienes cuenta?",
          footerLink: "Iniciar sesión",
          profileCta: "Completar perfil",
        },
      },
      profile: {
        title: "Configuración del perfil",
        subtitle: "Actualiza tus datos de contacto, preferencias y idioma.",
        intro: "Mantén tu perfil actualizado para no perder novedades del viaje.",
        empty: {
          title: "Inicia sesión para gestionar tu perfil",
          copy:
            "Inicia sesión para actualizar tus datos, moneda y preferencias de idioma.",
          button: "Iniciar sesión",
        },
        form: {
          email: "Correo",
          phone: "Teléfono",
          country: "País",
          language: "Idioma",
          currency: "Moneda",
        },
        placeholders: {
          email: "you@team.com",
          phone: "+1 555 000 0000",
          country: "Selecciona tu país",
        },
        actions: {
          save: "Guardar cambios",
          saving: "Guardando...",
        },
        status: {
          saved: "Perfil actualizado correctamente.",
          loadError: "No pudimos cargar tu perfil.",
          saveError: "No pudimos guardar los cambios.",
        },
      },
      languages: {
        en: "Inglés",
        hi: "Hindi",
        ml: "Malayalam",
        ar: "Árabe",
        es: "Español",
        de: "Alemán",
      },
    },
  },
  de: {
    translation: {
      appName: "Waypoint",
      nav: {
        home: "Start",
        features: "Funktionen",
        how: "So funktioniert es",
        pricing: "Preise",
        stories: "Stories",
        profile: "Profil",
      },
      actions: {
        startPlanning: "Planung starten",
        login: "Anmelden",
        logout: "Abmelden",
        buildItinerary: "Reiseplan erstellen",
        seeHow: "So funktioniert es",
        openItinerary: "Reiseplan öffnen",
      },
      labels: {
        language: "Sprache",
        loading: "Wird geladen...",
      },
      home: {
        title: "Start",
        subtitle: "Dein Reisebereich ist bereit.",
      },
      tripPlanner: {
        eyebrow: "Kostenloser Trip-Planer",
        title: "Erstelle einen Reiseentwurf",
        subtitle: "Verwandle ein Ziel in einen editierbaren Tagesplan.",
        form: {
          destinationLabel: "Reiseziel",
          destinationPlaceholder: "z. B. Paris, Tokio, New York",
          daysLabel: "Tage",
          paceLabel: "Tempo",
        },
        pace: {
          relaxed: "Entspannt",
          balanced: "Ausgewogen",
          fast: "Schnell",
        },
        actions: {
          generate: "Plan erstellen",
          generating: "Wird erstellt...",
          regenerate: "Plan neu erstellen",
          regenerateDay: "Tag neu erstellen",
          regeneratingDay: "Wird neu erstellt...",
          editDay: "Tag bearbeiten",
          doneEditing: "Bearbeitung fertig",
        },
        results: {
          title: "Dein Entwurfs-Itinerary",
          summary: "{{days}} Tage in {{destination}}",
          pace: "Tempo: {{pace}}",
          meta: "Ca. {{hours}} Std./Tag • {{stops}} Stopps gesamt",
          focus: "Schwerpunktgebiet: {{area}}",
          dayLabel: "Tag {{day}}",
          totalTime: "Gesamtzeit: {{hours}} Std.",
          hoursShort: "{{hours}} Std.",
          itemMeta: "{{hours}} Std. · {{category}}",
          generated: "Aus Offline-Vorschlägen erstellt.",
          fallback:
            "Wir zeigen einen allgemeinen Plan, da dieses Ziel noch nicht im Datensatz ist.",
        },
        map: {
          title: "Kartenvorschau",
          source: "OpenStreetMap",
          loading: "Karte wird geladen...",
          error: "Karte konnte nicht geladen werden.",
          noResults: "Für dieses Ziel wurde keine Karte gefunden.",
          open: "Karte öffnen",
          alt: "Karte von {{destination}}",
        },
        slots: {
          morning: "Morgen",
          afternoon: "Nachmittag",
          evening: "Abend",
        },
        categories: {
          landmark: "Sehenswürdigkeit",
          museum: "Museum",
          neighborhood: "Viertel",
          park: "Park",
          market: "Markt",
          experience: "Erlebnis",
          food: "Essen",
          nightlife: "Nachtleben",
          relax: "Entspannung",
          viewpoint: "Aussicht",
        },
        empty: {
          title: "Starte mit einem Reiseziel",
          copy: "Gib eine Stadt ein und wir erstellen einen Tagesplan.",
        },
        helper: "Noch keine Live-Daten. Dies ist ein kostenloser Entwurf zum Bearbeiten.",
        status: {
          error: "Plan konnte nicht erstellt werden. Bitte erneut versuchen.",
          missingDestination: "Bitte gib ein Reiseziel ein.",
        },
      },
      landing: {
        hero: {
          eyebrow: "Plattform für Reiseorganisation",
          title: "Plane Reisen mühelos ab der ersten Idee.",
          lead:
            "Itinerare, Budgets und Gruppen-Chats an einem Ort. Waypoint hilft euch, schneller zu entscheiden.",
          primary: "Reiseplan erstellen",
          secondary: "So funktioniert es",
        },
        stats: [
          { value: "4.9", label: "Durchschnittliche Organisator-Bewertung" },
          { value: "52k", label: "Koordinierte Reisen in 2025" },
          { value: "12 hrs", label: "Pro Gruppe durchschnittlich gespart" },
        ],
        card: {
          header: "Nächste Reise",
          dates: "Apr 18 - Apr 24",
          name: "Küstenreise Portugal",
          travelersConfirmedLabel: "Reisende bestätigt",
          travelersPendingLabel: "ausstehend",
          budgetLabel: "Budgetziel pro Reisender",
          ideasLabel: "gespeicherte Ideen",
          bookedLabel: "gebucht",
          progress: "68% des Plans sind abgeschlossen",
        },
        features: {
          title: "Alles, was eure Gruppe braucht, um schnell voranzukommen",
          subtitle:
            "Waypoint organisiert Entscheidungen mit geteilten To-dos, Kalendern und Budgets in Echtzeit.",
          items: [
            {
              title: "Geteiltes Itinerar",
              copy:
                "Aktivitäten per Drag-and-drop organisieren und abstimmen. Änderungen sind sofort sichtbar.",
            },
            {
              title: "Intelligentes Budget-Tracking",
              copy:
                "Kosten automatisch aufteilen, Limits setzen und offene Posten sofort sehen.",
            },
            {
              title: "Live-Gruppenupdates",
              copy:
                "Nachrichten, Erinnerungen und Checklisten halten alle auf Kurs.",
            },
            {
              title: "Reisevorlagen",
              copy:
                "Starte mit kuratierten Vorlagen für Wochenenden oder internationale Reisen.",
            },
            {
              title: "Partner-Marktplatz",
              copy:
                "Buche Aufenthalte, Transport und Erlebnisse bei vertrauenswürdigen Partnern.",
            },
            {
              title: "Offline-Zugriff",
              copy:
                "Lade den finalen Plan herunter, damit er auch offline bereit ist.",
            },
          ],
        },
        how: {
          title: "So funktioniert Waypoint",
          subtitle: "Von der Inspiration zur Bestätigung in drei Schritten.",
          steps: [
            {
              title: "Reise-Hub erstellen",
              copy:
                "Termine hinzufügen, Reisende einladen und Ideen sammeln.",
            },
            {
              title: "Abstimmen und finalisieren",
              copy:
                "Präferenzen sammeln, Buchungen fixieren und Tagesplan erstellen.",
            },
            {
              title: "Gemeinsam reisen",
              copy:
                "Live-Updates, Karten und Bestätigungen in einem Itinerar teilen.",
            },
          ],
        },
        demo: {
          title: "Reise-Zeitplan auf einen Blick",
          subtitle:
            "Waypoint zeigt Tagespläne, Transportfenster und Check-ins übersichtlich.",
          checklist: [
            "Ankunftszeiten und Transport automatisch abstimmen.",
            "Treffpunkte für jeden Tag markieren.",
            "Push-Erinnerungen für die Gruppe setzen.",
          ],
          timeline: [
            {
              time: "8:00 AM",
              title: "Treffen in Lissabon",
              detail: "Abholung und Frühstück an der Avenida.",
            },
            {
              time: "11:30 AM",
              title: "Küstenfahrt",
              detail: "Van gebucht, Gepäck gepackt.",
            },
            {
              time: "3:00 PM",
              title: "Check-in",
              detail: "Hotel Bahia, Zimmer bereit.",
            },
            {
              time: "7:30 PM",
              title: "Begrüßungsdinner",
              detail: "Gruppentisch reserviert.",
            },
          ],
        },
        stories: {
          title: "Teams und Freunde vertrauen Waypoint",
          subtitle:
            "Von Offsites bis Feiern vertrauen Organisatoren einer gemeinsamen Quelle.",
          testimonials: [
            {
              quote:
                "Wir haben ein Retreat für 24 Personen geplant und nie den Überblick über die Ausgaben verloren. Das geteilte Itinerar hielt alle ausgerichtet.",
              name: "Maya R.",
              title: "People Operations, Northwind",
            },
            {
              quote:
                "Waypoint machte die Abstimmung über Aktivitäten einfach. Wir sparten Stunden an Abstimmungen.",
              name: "Jordan P.",
              title: "Travel organizer, Atlas Crew",
            },
          ],
        },
        pricing: {
          title: "Einfache Preise für jede Reise",
          subtitle: "Starte kostenlos und upgrade bei Bedarf.",
          tiers: [
            {
              name: "Starter",
              price: "$0",
              note: "Perfekt für Wochenendtrips.",
              features: [
                "Eine aktive Reise",
                "Gruppenabstimmung",
                "Basis-Budget-Tracking",
              ],
              cta: "Loslegen",
              variant: "ghost",
            },
            {
              name: "Collective",
              price: "$12",
              note: "Pro Organisator pro Monat.",
              features: [
                "Unbegrenzte Reisen",
                "Live-Messaging",
                "Geteilte Vorlagen",
                "Automatische Erinnerungen",
              ],
              cta: "Kostenlos testen",
              variant: "primary",
              featured: true,
              badge: "Beliebt",
            },
            {
              name: "Enterprise",
              price: "Individuell",
              note: "Für Reise-Teams im großen Stil.",
              features: [
                "Dedizierter Concierge",
                "Erweiterte Berichte",
                "Admin-Kontrollen",
              ],
              cta: "Vertrieb kontaktieren",
              variant: "ghost",
            },
          ],
        },
        cta: {
          title: "Bereit, deine nächste Reise zu organisieren?",
          subtitle:
            "Erstelle deinen Reise-Hub in Minuten und lade dein Team ein.",
          label: "Geschäftliche E-Mail",
          placeholder: "you@team.com",
          button: "Planung starten",
          note: "Kostenlose 14-Tage-Testversion. Keine Kreditkarte erforderlich.",
          helper: "Möchtest du ein vollständiges Konto?",
          helperLink: "Jetzt erstellen",
        },
      },
      footer: {
        blurb:
          "Ein gemeinsamer Ort, um Gruppenreisen zu organisieren, zu buchen und zu erleben.",
        product: "Produkt",
        company: "Unternehmen",
        resources: "Ressourcen",
        links: {
          features: "Funktionen",
          pricing: "Preise",
          demo: "Demo",
          about: "Über uns",
          careers: "Karriere",
          contact: "Kontakt",
          support: "Support",
          guides: "Guides",
          privacy: "Datenschutz",
        },
        bottom: {
          copyright: "Copyright 2026 Waypoint. All rights reserved.",
          terms: "AGB",
          privacy: "Datenschutz",
          security: "Sicherheit",
        },
      },
      auth: {
        messages: {
          required: "E-Mail und Passwort sind erforderlich.",
          passwordMismatch: "Die Passwörter stimmen nicht überein.",
          loginSuccess: "Anmeldung erfolgreich.",
          registerSuccess: "Konto erstellt. Du kannst dich jetzt anmelden.",
          profileHint: "Konto erstellt. Bitte Profil vervollständigen.",
        },
        login: {
          eyebrow: "Willkommen zurück",
          title: "Melde dich an, um weiterzuplanen.",
          subtitle: "Greife auf geteilte Itinerare, Budgets und Updates zu.",
          list: [
            "Genau dort weitermachen, wo die Gruppe aufgehört hat.",
            "Echtzeit-Updates und Buchungsstatus sehen.",
            "Mit automatischen Erinnerungen abgestimmt bleiben.",
          ],
          formTitle: "Anmelden",
          formSubtitle: "Verwende die registrierte E-Mail.",
          emailLabel: "E-Mail",
          passwordLabel: "Passwort",
          button: "Anmelden",
          loading: "Anmeldung läuft...",
          footer: "Neu bei Waypoint?",
          footerLink: "Konto erstellen",
          signedInAs: "Angemeldet als {{email}}",
          profileCta: "Zum Profil",
        },
        register: {
          eyebrow: "Planung starten",
          title: "Erstelle dein Waypoint-Konto.",
          subtitle:
            "Erstelle deinen Reise-Hub, lade Reisende ein und halte alles synchron.",
          list: [
            "Itinerare, Budgets und Checklisten organisieren.",
            "Alle mit Echtzeit-Updates ausrichten.",
            "Von der Idee zur Buchung an einem Ort.",
          ],
          formTitle: "Konto erstellen",
          formSubtitle: "Nutze deine geschäftliche E-Mail zum Start.",
          emailLabel: "E-Mail",
          passwordLabel: "Passwort",
          confirmLabel: "Passwort bestätigen",
          button: "Konto erstellen",
          loading: "Konto wird erstellt...",
          footer: "Bereits ein Konto?",
          footerLink: "Anmelden",
          profileCta: "Profil abschließen",
        },
      },
      profile: {
        title: "Profil-Einstellungen",
        subtitle: "Aktualisiere Kontaktdaten, Präferenzen und Sprache.",
        intro: "Halte dein Profil aktuell, damit Updates richtig ankommen.",
        empty: {
          title: "Melde dich an, um dein Profil zu verwalten",
          copy:
            "Melde dich an, um Kontaktdaten, Währung und Sprache zu aktualisieren.",
          button: "Anmelden",
        },
        form: {
          email: "E-Mail",
          phone: "Telefonnummer",
          country: "Land",
          language: "Sprache",
          currency: "Währung",
        },
        placeholders: {
          email: "you@team.com",
          phone: "+1 555 000 0000",
          country: "Land auswählen",
        },
        actions: {
          save: "Änderungen speichern",
          saving: "Wird gespeichert...",
        },
        status: {
          saved: "Profil erfolgreich aktualisiert.",
          loadError: "Profil konnte nicht geladen werden.",
          saveError: "Änderungen konnten nicht gespeichert werden.",
        },
      },
      languages: {
        en: "Englisch",
        hi: "Hindi",
        ml: "Malayalam",
        ar: "Arabisch",
        es: "Spanisch",
        de: "Deutsch",
      },
    },
  },
};

const getStoredLanguage = () => {
  if (typeof window === "undefined") {
    return "en";
  }
  return window.localStorage.getItem("waypoint.language") || "en";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.dir(i18n.language);
}

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("waypoint.language", lng);
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir(lng);
  }
});

export default i18n;
