from app.extensions import mongo


class Colors:
    """
    collection format:
    {
        "SIGMA": "#ff5733",
        "JT": "#33ff57",
        "JM": "#3357ff",
        "ThunderRecords": "#ff6633",
        "TribeofSpite": "#33ff66",
        "TribeofWarlords": "#b74",
        "Twist": "#048",
        "VortexPoint": "#6633ff",
        "Whisper": "#0ab",
        "YellowShade": "#ff3366",
        "Yeworks": "#db6",
        "Zaamtech": "#66ff33",
        "Zooin": "#3366ff",
        "_hold_": "#a2b"
    }
    
    """

    @staticmethod
    def get_colors():
        colors = mongo.db.colors.find_one()
        return colors
