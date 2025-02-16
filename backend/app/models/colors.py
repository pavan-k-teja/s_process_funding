from app.extensions import mongo


class Colors:

    @staticmethod
    def get_colors():
        colors = mongo.db.colors.find_one()
        return colors
