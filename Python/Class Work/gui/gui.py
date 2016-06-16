import tkinter

#New Window
window = tkinter.Tk()
window.title("Test Window")

#Window Size
window.geometry("1000x600")

#image
window.wm_iconbitmap('penguin.ico')

#run GUI
window.mainloop()
