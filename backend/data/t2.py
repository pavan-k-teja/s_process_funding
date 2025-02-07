import csv
import matplotlib.pyplot as plt

def display_colors(csv_file):
    names = []
    colors = []

    with open(csv_file, mode='r') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            if len(row) == 2:
                names.append(row[0])
                colors.append(row[1])

    fig, ax = plt.subplots(figsize=(10, len(names) * 0.5))
    ax.barh(names, [1] * len(names), color=colors)
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names)
    ax.set_xticks([])
    ax.set_title('Name and Color Strip')
    plt.show()

# Replace with the path to your CSV file
csv_file_path = 'utility_to_color.csv'
display_colors(csv_file_path)