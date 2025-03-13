from flask import Flask
from flask import request
import pickle
import keras
from keras import utils
from keras.models import Sequential
from keras.models import load_model
from keras.layers import Dense,Activation,Dropout
from keras.layers import BatchNormalization
from keras.optimizers import Adam
from tensorflow.keras.layers import Input
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as pltn
import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize
import requests
import io
import json
from flask_cors import CORS, cross_origin

def save_client_updates(model, client_id, additional_info=None):
  client_updates = {"weights": model.get_weights()}
  if additional_info:
    client_updates.update(additional_info)
  with open(f"client_{client_id}_update.pkl", "wb") as f:
    pickle.dump(client_updates, f)

def load_weights_from_pkl(model, filepath):

  # Ensure compatibility between model and weights:
  if not model.built:
    raise ValueError("Model must be built before loading weights.")

  # Load serialized weights from the pickle file:
  with open(filepath, "rb") as f:
    weights = pickle.load(f)

  # Set the loaded weights in the model:
  model.set_weights(weights['weights'])

  return model
def create_model():
  model=Sequential()
  model.add(Input(shape=(4,)))
  model.add(Dense(1000,activation='relu'))
  model.add(Dense(500,activation='relu'))
  model.add(Dense(300,activation='relu'))
  model.add(Dropout(0.2))
  model.add(Dense(3,activation='softmax'))
  model.compile(loss='categorical_crossentropy',optimizer=Adam(learning_rate=0.01),metrics=['accuracy'])
  model.summary()
  return model

def trainClient(client_id,epochs):
  print("Traning Client",client_id)
  model = create_model()
  filepath = f"global_update.pkl"
  loaded_model = load_weights_from_pkl(model, filepath)
  data=pd.read_csv(f"./iris_data_{client_id}.csv")
  X=data.iloc[:,1:5].values
  y=data.iloc[:,5].values
  X_normalized=normalize(X,axis=0)
  total_length=len(data)
  train_length=int(0.9*total_length)
  test_length=int(0.1*total_length)

  X_train=X_normalized[:train_length]
  X_test=X_normalized[train_length:]
  y_train=y[:train_length]
  y_test=y[train_length:]
  y_train=utils.to_categorical(y_train,num_classes=3)
  y_test=utils.to_categorical(y_test,num_classes=3)
  model.fit(X_train,y_train,validation_data=(X_test,y_test),batch_size=20,epochs=epochs,verbose=1)
  additional_info = {"learning_rate": 0.01}
  print("saving Client pkl file",client_id)
  save_client_updates(model, client_id, additional_info)


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/train", methods=['POST'])
def run():
    
    payload = request.get_json()
    payload = json.loads(payload["completeData"])
    print('sad', payload.keys())

    data = payload['data']
    string_data = payload['value']
    fileModel = open('got.txt','w')
    fileModel.write(string_data)
    fileModel.close() 
    with io.open('global_update.pkl', "wb") as file:
      # Write the string data as bytes to the file
      file.write(string_data.encode('latin1'))

    # Access the data part of the request
    print(data['client_id'])
    trainClient(data['client_id'],int(data['epochs']))
    print("Sending Response", data['client_id'])

    url = 'http://host.docker.internal:9080/train-response'
    with open(f"./client_{data['client_id']}_update.pkl", 'rb') as file:
            loaded_data = pickle.load(file)  # Prepare the file to be sent in the POST request
            response = requests.post(url, json={'value':str(pickle.dumps(loaded_data),'latin1'),'data':{'client_id':data['client_id'],'epochs':data['epochs']}})  # Send the POST request
            if response.status_code == 200:
                print("File successfully sent to API.")
            else:
                print("Error occurred while sending file to API. Status code:", response.status_code)


    return 'File and data received'+ '200'

@app.route('/')
def hello():
    return 'Hello, Flask!'

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int("4600"),debug=True)

