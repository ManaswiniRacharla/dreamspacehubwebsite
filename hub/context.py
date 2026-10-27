from . import content

def site(request):
    return {"plans": content.PLANS, "nav": content.NAV}
