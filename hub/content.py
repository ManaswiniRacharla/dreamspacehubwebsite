"""All copy and 3D layouts live here. Units are metres; x runs right, z runs down the plan.
Wall: [x1,z1,x2,z2,[[distance_along_wall, width, 1 if main entrance]...]]. Furniture: [type,x,z,rotation_deg,size_a,size_b].
Each plan's `path` is the first-person walk (it starts outside and enters through the main door)."""
NAV = [("home", "Home"), ("journey", "Journey"), ("experience", "3D Experience"), ("services", "Services"),
       ("industries", "Who we serve"), ("why", "Why us"), ("franchise", "Franchise"), ("contact", "Contact")]

# ---- layouts -------------------------------------------------------------
HOME2 = dict(mode="house", w=12, d=9, h=2.8, outer=4,
    walls=[[0,0,12,0],[12,0,12,9],[12,9,0,9],[0,9,0,0,[[6.4,1,1]]],[0,4.5,12,4.5,[[1.5,1],[5.7,1],[8.8,1]]],[4.6,4.5,4.6,9],[7.2,4.5,7.2,9]],
    rooms=[["Living",3.9,2.4],["Kitchen & dining",9.2,2.2],["Master bedroom",2.3,7],["Bath",5.9,7],["Bedroom 2",9.6,7]],
    zones=[[7.2,0,4.2,1.8,"tile"],[4.6,4.5,2.6,4.5,"tile"]],
    furn=[["rug",3.9,2.15,0,2.8,1.9],["tv",3.9,.35,0],["sofa",3.9,3.4,180,2.2],["coffee",3.9,2.15,0,1.1],["armchair",5.6,2.2,-90],["plant",.55,.55,0,1.4],["lamp",5.5,3.9,0],
          ["kitchen",9.2,.45,0,3.6],["fridge",11.45,.5,0],["dining",9,3.1,0,1.6],
          ["bed",2.3,7.6,180,1.6],["nstand",1,8.6,180],["nstand",3.6,8.6,180],["wardrobe",3.6,4.9,0,1.8],
          ["vanity",5.2,8.65,180],["toilet",6.5,8.6,180],["shower",6.65,5.2,0],
          ["bed",10.2,7.6,180,1.6],["nstand",9.1,8.6,180],["nstand",11.4,8.6,180],["wardrobe",7.55,6.3,90,1.8],["plant",11.4,5.1,0,1.2]],
    path=[[-6,2.6],[.9,2.6],[1.7,1.3],[4.4,1.2],[6.6,1.5],[10.6,1.5],[10.6,3.7],[9.2,4.1],[8.8,4.8],[8.8,5.8],[8.4,6.6],[8.8,5.8],[8.8,4.8],[9.2,4.1],[10.6,3.7],[10.6,1.5],[6.6,1.5],[4.4,1.2],[2.4,1.4],[1.4,3.4],[1.5,4.7],[1.7,5.7],[2.9,5.8]],
    shot=dict(p=[1.0,1.6,2.0], t=[9,1.1,2.2], fov=70))
HOME3 = dict(mode="house", w=14, d=8, h=2.8, outer=4,
    walls=[[0,0,14,0],[14,0,14,8],[14,8,0,8],[0,8,0,0,[[4,1,1]]],[8,0,8,8,[[1.8,1.6],[5.9,1]]],[8,3.4,14,3.4,[[4.7,1]]],[11.5,3.4,11.5,8]],
    rooms=[["Open living",3,2],["Dining",5.8,6.3],["Kitchen",11,1.6],["Suite",9.7,5.8],["Study",12.8,5.7]],
    zones=[[8.3,0,5.4,1.9,"tile"]],
    furn=[["rug",3,1.95,0,2.8,1.9],["tv",3,.35,0],["sofa",3,3.15,180,2.2],["coffee",3,1.85,0,1.1],["armchair",5.3,1.9,-90],["plant",.5,.55,0,1.5],["plant",.5,7.4,0,1.2],
          ["shelf",.35,6.3,90,1.2],["dining",5.8,6.3,0,1.8],
          ["kitchen",11,.45,0,4],["fridge",13.5,.5,0],["island",11,2.2,0,2.2],
          ["bed",9.7,6.75,180,1.6],["nstand",8.6,7.65,180],["nstand",10.8,7.65,180],["wardrobe",11.1,4.6,-90,1.8],
          ["desk",12.7,7.45,180,1.4],["shelf",13.7,5.2,-90,1.4]],
    path=[[-6,4],[.9,4],[1.7,4.6],[4,4.6],[6.8,4.3],[7.4,5.9],[8.7,5],[9.6,4.5],[8.7,5],[7.4,5.9],[6.8,4.3],[7.2,2.2],[8.3,1.8],[9.5,1.3],[12.4,1.3],[12.7,2.6],[12.7,4],[12.7,5.3]],
    shot=dict(p=[.9,1.62,6.8], t=[7,1,3], fov=70))
ROOM = dict(mode="room", w=9, d=6, h=3, outer=4,
    walls=[[0,0,9,0],[9,0,9,6],[9,6,0,6,[[5.3,1.4,1]]],[0,6,0,0]],
    rooms=[["Living",2.8,2.4],["Dining",7,3.4]],
    furn=[["rug",2.6,2.9,0,3.2,2.2],["tv",2.6,.35,0],["sofa",2.6,4.15,180,2.3],["coffee",2.6,2.6,0,1.2],["armchair",.9,2.9,90],["plant",.6,.6,0,1.5],["lamp",1,4.5,0],
          ["sideboard",8.65,2.5,-90,1.8],["dining",7,3.6,0,1.8],["plant",8.4,5.4,0,1.3]],
    path=[[3.7,9.5],[3.7,5.3],[4.5,4.7],[4.9,2.7],[4.9,1.3],[6,1.2],[8,1.2],[8.2,2]],
    shot=dict(p=[8.2,1.55,5.4], t=[2.2,1,2.2], fov=70))
SHOP = dict(mode="flow", w=16, d=10, h=3.2, outer=4,
    walls=[[0,0,16,0],[16,0,16,10],[16,10,0,10,[[8.5,2,1]]],[0,10,0,0]],
    rooms=[["Entry",7.5,8.7],["Display",4,1.5],["Billing",14,6.2]],
    furn=[["wallshelf",5.5,.25,0,9],["wallshelf",15.75,3,-90,5],["gond",4.2,3.3,0,5],["gond",4.2,5.2,0,5],["gond",4.2,7.1,0,5],["round",11.5,3.6,0],["billing",14,7.8,180,3],["plant",1,9.2,0,1.5],["plant",15,9.2,0,1.5]],
    path=[[7.5,15],[7.5,9.4],[7.5,6.2],[8.3,2.5],[9.8,1.8],[12.8,1.8],[13.3,3.4],[13.5,5.6]],
    crowd=[[7.5,9.2],[7.5,6.2],[8.3,2.6],[9.8,1.9],[12.8,1.9],[13.3,3.4],[13.6,5.8],[12.5,6.4],[9,6.2],[7.5,9.2]],
    shot=dict(p=[7.5,1.65,9.2], t=[8,1.4,2], fov=70))
FACADE = dict(mode="facade", floors=5, w=10, d=6)
BUILD = dict(mode="build", floors=3, cols=4, rows=3)
BUILD4 = dict(mode="build", floors=4, cols=5, rows=3)
TOWER = dict(mode="tower", floors=9)
MASSING = dict(mode="massing", seed=7, n=12)

def I(slug, title, blurb, plan, headline, body, points, **over):
    return dict(slug=slug, title=title, blurb=blurb, plan={**plan, **over, "title": title}, headline=headline, body=body, points=points)

SERVICES = [
 I("floor-plan-projection", "Floor Plan Projection", "Experience your complete layout at true 1:1 scale before any construction begins.", HOME2,
   "Walk the plan before it becomes walls.", "Your floor plan is projected onto the studio floor at true 1:1 scale. Walk the corridors, stand in each bedroom and check every door swing before the first brick is laid.",
   ["Every room at real size", "Layout problems found while they are cheap to fix", "Walls, doors and furniture shown to scale"]),
 I("interior-design-visualization", "Interior Design Visualization", "See furniture placement, material finishes and lighting effects in your actual space.", ROOM,
   "Choose finishes by standing among them.", "Furniture, materials and lighting are shown inside the real footprint of your space, so decisions are made in the room and not from a catalogue.",
   ["Furniture placement at scale", "Material and finish comparison", "Lighting effects in your own space"]),
 I("facade-elevation-review", "Facade & Elevation Review", "Examine your building exterior from multiple angles with material and lighting accuracy.", FACADE,
   "See the outside before it is built.", "Study your building's exterior from the street and from above. Materials, fins and projections are shown with accurate light so you can compare elevation options with confidence.",
   ["Multiple viewing angles", "Material and lighting accuracy", "Compare elevation options side by side"]),
 I("digital-conversion-services", "Digital Conversion Services", "Transform sketches, CAD files or 3D models into projection-ready assets.", HOME2,
   "Any starting point works.", "Hand sketches, CAD drawings and 3D models are converted into scaled, projection-ready assets. The drawing on the left becomes a space you can walk.",
   ["Sketches to scaled drawings", "CAD and 3D model import", "Ready for projection and VR"], mode="sketch", thumbP=.5, shot=dict(p=[6,17,13], t=[6,0,4.5], fov=45)),
 I("immersive-vr-experiences", "Immersive VR Experiences", "Step into your design with VR headsets for detailed exploration and spatial understanding.", HOME2,
   "Step inside your design.", "Put on a headset and move through the design for close-up detail and a real sense of space. VR complements full-scale projection; it does not replace it.",
   ["Headset walkthroughs", "Detail you can inspect up close", "Works alongside full-scale projection"], mode="vr", shot=dict(p=[.5,1.6,5.0], t=[3.0,.7,8.0], fov=72)),
 I("complete-construction-delivery", "Complete Construction Delivery", "Full-spectrum build services from architectural design through final handover.", BUILD,
   "One team, brief to keys.", "Our in-house studio carries the approved design through construction to handover, so one team stays accountable from first sketch to final key.",
   ["Architecture to handover under one roof", "Fixed quotes with no hidden costs", "500+ quality checkpoints"]),
]
INDUSTRIES = [
 I("architecture", "Architecture", "Validate proportions and circulation before drawings go out.", MASSING,
   "Test the massing before you draw it.", "Check proportions, circulation and how buildings sit together on site at full scale, then release drawings with fewer revisions.",
   ["Proportions checked on site", "Circulation tested by walking it", "Fewer revision rounds"]),
 I("real-estate", "Real Estate", "Buyers walk the unit and sign before a brick is laid.", TOWER,
   "Sell the unit before it exists.", "Buyers walk their exact unit in projection, so confidence is high and sign-up happens before construction.",
   ["Every unit type walkable", "Faster buyer decisions", "Fewer post-sale changes"]),
 I("interior-design", "Interior Design", "Approve a moodboard you've actually stood inside.", ROOM,
   "Approve a moodboard you've stood inside.", "Clients experience layouts, finishes and lighting at scale and approve with certainty, which cuts rework late in the project.",
   ["Clients approve in the space", "Finishes compared at scale", "Less late-stage rework"]),
 I("construction", "Construction", "Lock specs and clearances before site mobilisation.", BUILD4,
   "Lock the specs before the site opens.", "Confirm clearances, services routes and finishes in projection so the site team starts from decisions that are already made.",
   ["Clearances confirmed", "Specs locked early", "Cleaner site handover"]),
 I("homeowners", "Homeowners", "See your dream space at full scale. Build with zero regret.", HOME3,
   "Build with zero regret.", "Walk your future home at full scale with your family. Move a wall, change a door and see the result live before anything is built.",
   ["Walk it with your family", "Change walls and finishes live", "Move in to a home that feels familiar"]),
 I("commercial-projects", "Commercial Projects", "Preview footfall flow and brand experience before fitout.", SHOP,
   "Watch the footfall before the fitout.", "Preview how visitors move through a store, office or showroom and how the brand reads on entry, then adjust layouts before fitout begins.",
   ["Footfall flow previewed", "Brand experience tested", "Layouts adjusted before fitout"]),
]
PLANS = {"home": {**HOME2, "title": "Home"}}
for it in SERVICES + INDUSTRIES:
    PLANS[it["slug"]] = it["plan"]

JOURNEY = [
    ("Vision Discovery", "Share your lifestyle needs, family requirements and design preferences with our consultants."),
    ("Immersive Experience", "Walk through your future home at full scale with guided projection and VR enhancement."),
    ("Collaborative Refinement", "Work with our team to perfect every detail, from spatial flow to material selection."),
    ("Realization & Delivery", "Watch your approved design transform into reality with our quality-focused construction team."),
]
STATS = [
    (500, "+", "Quality checkpoints"),
    (100, "%", "Price protection"),
    (98, "%", "Customer satisfaction"),
    (15, "+", "Years experience"),
]
PROMISES = [
    ("500+ Quality Checkpoints", "Every projection and build phase undergoes rigorous quality validation for precision and reliability.", "shield"),
    ("100% Price Protection", "Fixed quotes with no hidden costs. Your budget stays protected from start to finish.", "coin"),
    ("Energy-Efficient Design", "Optimized layouts for natural lighting, ventilation and sustainable living.", "sun"),
    ("Industry-Leading CSAT", "Highest customer satisfaction scores driven by transparent communication and delivery excellence.", "sparkle"),
    ("Fully Customized Solutions", "Every project tailored to your lifestyle, budget and unique requirements.", "wand"),
    ("Functional Living Spaces", "Designs focused on practical living: ample storage, smart workflows and comfort.", "plan"),
]


# ---- franchise -----------------------------------------------------------
FRANCHISE = {
    "eyebrow": "Partner with DreamSpaceHub",
    "lead": "Run a full-scale projection studio under the DreamSpaceHub banner. "
            "Two models: own and operate it yourself, or own it and let our team run the floor.",
    "models_eyebrow": "Franchise models",
    "models_title": "Two ways to run a studio.",
    "models_lead": "Same studio, same technology. The difference is who runs the floor and how the economics are split.",
}
FRANCHISE_MODELS = [
    {
        "key": "FOFO",
        "title": "FOFO (Franchisee Owned Franchisee Operated)",
        "fees": "₹15 Lakhs One-Time Franchise Fee + 4% Royalty on Sales",
        "terms": [
            "Franchisee is responsible for complete setup cost and daily operations.",
            "Must arrange 2,100 to 3,500 sq ft space with 14-foot ceiling height.",
            "Staff training and marketing guidelines provided by DreamSpaceHub.",
            "Initial hardware purchase must be made through approved vendors.",
        ],
    },
    {
        "key": "FOCO",
        "title": "FOCO (Franchisee Owned Company Operated)",
        "fees": "₹42.5 Lakhs Initial Capital + 50/50 Revenue Split on Profit Margins",
        "terms": [
            "Franchisee owns the physical property/assets, Company operates the daily staff and bookings.",
            "Monthly reporting and audits managed by DreamSpaceHub corporate team.",
            "Company covers operational software updates and hardware maintenance support.",
            "Minimum lock-in period of 3 years applies.",
        ],
    },
]
