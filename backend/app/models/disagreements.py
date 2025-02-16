from app.extensions import mongo
from bson.json_util import dumps, loads

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
        disagreements = mongo.db.disagreements.find()
        simple_disagreements = {}
        for disagreement in disagreements:
            for key, value in disagreement.items():
                if key != "_id":
                    simple_disagreements[key] = loads(dumps(value))
                    
        print(simple_disagreements)
        return simple_disagreements