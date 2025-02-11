from app.extensions import mongo


class Disagreements:
    """
    collection format:
    {
        "XO": {
            "Flowerscape": 93318,
            "Prophecycurity": 0,
            "Ithigh": 0,
            "ThunderRecords": 0,
            "Nimbletainment": 1712330,
            "Whisper": 1566105,
        }
    }
    """

    @staticmethod
    def get_all_disagreements():
        disagreements = mongo.db.disagreements.find_one()
        return disagreements