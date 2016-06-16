import tkinter

#New Window
window = tkinter.Tk()
window.title("Scooby Dooby Doo")

#Window Size
window.geometry("1000x600")

#image
window.wm_iconbitmap('penguin.ico')

#run GUI
window.mainloop()
