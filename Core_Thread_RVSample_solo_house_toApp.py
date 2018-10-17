'''
Created on 23 Nov 2017

@author: 2Pi
'''

from itertools import combinations
from copy import copy, deepcopy

import multiprocessing

import matplotlib.pyplot as plt

import csv
import numpy
import timeit
import logging
import time
import threading
import math

#import parallelTestModule

#logging.basicConfig(filename='log_thread.txt',level=logging.DEBUG,format="%(asctime)s:%(levelname)s:%(message)s")


# create a dictionary according to a list (power set)
def buildDictFunc(list_ag,psi_a,psi_b,t):
    psi_function = {}
    subs = power_set(list_ag)
    for coal in subs:
        coal_consumption = 0
        for agent in coal:
            index_ag = int(agent)
            coal_consumption += consumptions[index_ag][t]
        psi_value = 0
        if coal_consumption <= objective_norm[t]:
            psi_value = coal_consumption * numpy.exp(psi_a*(coal_consumption-objective_norm[t]))
        else:
            psi_value = coal_consumption * numpy.exp(psi_b*(coal_consumption-objective_norm[t]))
        
        #print("coal: ", coal, " - psi: ", psi_value)       
        key_coal = ','.join(str(e) for e in coal)
        psi_function[key_coal] = psi_value
        #print(psi_function[key_coal])
        
    return psi_function

# compute power set of a list
def power_set(List):
    """
    function to return the powerset of a list
    """
    subs = [list(j) for i in range(len(List)) for j in combinations(List, i+1)]
    return subs

# Compute factiorial of n
def factorial(n):

    fact = 1

    for factor in range(1, n + 1):
        fact *= factor

    return fact

# Compute the Exact SV
def computeSV(list_ag, dict_func):
    list_phi = []
    for i in list_ag:
        phi_i = 0
        for s in range(0,total_users):
            marginal_contr_s = 0
            coeff = 0
            if s == 0:
                coeff = (factorial(s) * factorial(total_users-1-s)) / factorial(total_users)
                marginal_contr_s = dict_func.get(i)
                #print(s,coeff, marginal_contr_s)
            else:
                coeff = (factorial(s) * factorial(total_users-1-s)) / factorial(total_users)
                for key_coal in dict_func:
                    key_coal_spl = key_coal.split(",")
                    #print("i: ", i, " s: ",s, " len coal ", len(key_coal))
                    if i not in key_coal_spl and len(key_coal_spl) == s:
                        #print("i: ", i, " s: ",s, " coal: ", key_coal_spl, " len coal ", len(key_coal))
                        psi_no_i = dict_func.get(key_coal)
    #                     print("NO i", key_coal)
    #                     print("NO i", psi_no_i)
                        key_coal_spl.append(i)
                        key_coal_spl = list(map(int, key_coal_spl))
                        key_coal_spl.sort()
                        key_coal_spl = list(map(str, key_coal_spl))
                        #print("SI i", ','.join(str(e) for e in key_coal_spl))
                        psi_si_i = dict_func.get(','.join(str(e) for e in key_coal_spl))
                        if psi_si_i is not None:
                            #print("SI i", psi_si_i)
                            marginal_contr_s += psi_si_i - psi_no_i
                        else:
                            print(str(key_coal_spl))
                        #print(s,key_coal,coeff, marginal_contr_s)
                    #print(key_coal_spl)
                    #print(key_coal,coeff, marginal_contr_s)
            phi_i += coeff * marginal_contr_s
            #print("S: ", s," phi: ", phi_i)
        list_phi.append(phi_i)
        #print("I: ", i," phi: ", phi_i)
        
    return list_phi      


def computeRndSVThread(total_users,consumptions,objective_norm,t,m_per_thread,psi_a,psi_b,phi_dict,th,all_rnd_perm):
   
    #m = 20000
    
    count = 0
    phi_values_of_th = numpy.zeros(total_users)
    while(count < m_per_thread):
            rnd_perm = numpy.random.permutation(total_users).tolist()
            #print("t: ",t," - M: ", count)
            #print(rnd_perm)
            #print(all_rnd_perm)
            if rnd_perm not in all_rnd_perm:
                #print("old: ",rnd_perm)
                for ind in range(0,total_users):
                    #for i in range(0,total_users):
                        #if rnd_perm[ind] == i:
                    to_remove = list(range(ind, total_users))
                    rnd_perm_pre = numpy.delete(rnd_perm, to_remove)
                    #print("i: ",i, " - new: ", rnd_perm_pre)
                    mc_i = 0
                    coal_cons_no_i = 0
                    for agent in rnd_perm_pre:
                        index_ag = int(agent)
                        coal_cons_no_i += consumptions[index_ag][t]
                    psi_value_no_i = 0
                    if coal_cons_no_i <= objective_norm[t]:
                        psi_value_no_i = coal_cons_no_i * numpy.exp(psi_a*(coal_cons_no_i-objective_norm[t]))
                    else:
                        psi_value_no_i = coal_cons_no_i * numpy.exp(psi_b*(coal_cons_no_i-objective_norm[t]))
                    
                    coal_cons_i = coal_cons_no_i + consumptions[rnd_perm[ind]][t]
                    
                    psi_value_i = 0
                    if coal_cons_i <= objective_norm[t]:
                        psi_value_i = coal_cons_i * numpy.exp(psi_a*(coal_cons_i-objective_norm[t]))
                    else:
                        psi_value_i = coal_cons_i * numpy.exp(psi_b*(coal_cons_i-objective_norm[t]))
                    
                    mc_i = psi_value_i - psi_value_no_i
                    
                    phi_values_of_th[rnd_perm[ind]] += mc_i
                
                #print(phi_matrix[th])
                all_rnd_perm.append(rnd_perm)
                #print(t,th,count)
                count += 1
    phi_dict[th] = phi_values_of_th
    return phi_dict




# Castro Randomized algorithm
def computeRandomCastroSV_Threaded(num_thread,consumptions,m,psi_a,psi_b):
    start_time_2 = timeit.default_timer()
    phi_values = numpy.zeros(total_users)
    #empty_done = numpy.zeros(total_users)
    #print(list_ag)
     
    m_per_thread = m/num_thread
     
    threads = []
    #phi_matrix = numpy.zeros((num_thread, total_users))
    manager = multiprocessing.Manager()
    all_rnd_perm = manager.list()
    phi_dict = manager.dict()
    for th in range(0,num_thread):
        obj_t = multiprocessing.Process(target=computeRndSVThread,args=(total_users,consumptions,objective_norm,t,m_per_thread,psi_a,psi_b,phi_dict,th,all_rnd_perm, ))
        threads.append(obj_t)
        obj_t.start()
        #time.sleep(1)
        #print(obj_t)
     
    for i in range(len(threads)):
        threads[i].join()
        #print("Joined")
     
    #print(phi_dict.values())
    #print(len(all_rnd_perm),all_rnd_perm)
     
    for th in range(0,num_thread):
        phi_values += phi_dict.get(th).tolist()
        #print(t,phi_matrix[th,:])
     
    phi_values = phi_values / m
    #print(t,phi_values)
#     for ind in range(0,total_users):
#         phi_vector[ind] = phi_vector[ind]/(m)
    elapsed_2 = timeit.default_timer() - start_time_2
    #print(elapsed_2)
    return phi_values

def computeRandomCastroSV(consumptions,m,psi_a,psi_b):
    #start_time_2 = timeit.default_timer()
    phi_vector = numpy.zeros(total_users)
    count = 0
    #m = 20000
    all_rnd_perm = []
    #empty_done = numpy.zeros(total_users)
    while(count < m):
        rnd_perm = numpy.random.permutation(total_users).tolist()
        print("t: ",t,"M: ", count)
        #print(rnd_perm)
        #print(all_rnd_perm)
        if rnd_perm not in all_rnd_perm:
            #print("old: ",rnd_perm)
#             for i in range(0,total_users):
#                 ind = rnd_perm.index(i)
            for ind in range(0,total_users):
                #print(rnd_perm,ind,i)
                #for ind in range(0,total_users):
                    #if rnd_perm[ind] == i:
                to_remove = list(range(ind, total_users))
                rnd_perm_pre = numpy.delete(rnd_perm, to_remove)
                #print("i: ",i, " - new: ", rnd_perm_pre)
                mc_i = 0
                coal_cons_no_i = 0
                for agent in rnd_perm_pre:
                    index_ag = int(agent)
                    coal_cons_no_i += consumptions[index_ag][t]
                psi_value_no_i = 0
                if coal_cons_no_i <= objective_norm[t]:
                    psi_value_no_i = coal_cons_no_i * numpy.exp(psi_a*(coal_cons_no_i-objective_norm[t]))
                else:
                    psi_value_no_i = coal_cons_no_i * numpy.exp(psi_b*(coal_cons_no_i-objective_norm[t]))
                
                coal_cons_i = coal_cons_no_i + consumptions[rnd_perm[ind]][t]
                
                psi_value_i = 0
                if coal_cons_i <= objective_norm[t]:
                    psi_value_i = coal_cons_i * numpy.exp(psi_a*(coal_cons_i-objective_norm[t]))
                else:
                    psi_value_i = coal_cons_i * numpy.exp(psi_b*(coal_cons_i-objective_norm[t]))
                
                mc_i = psi_value_i - psi_value_no_i
                
                phi_vector[rnd_perm[ind]] += mc_i

#                CODE FOR COMPUTING THE MAX AND MIN MARGINAL CONTRIBUTION
#                 if mc_i > max_mc[i]:
#                     print(count, i, " - MAX: ", mc_i)
#                     max_mc[i] = mc_i
#                 if mc_i < min_mc[i]:
#                     print(count, i, " - MIN: ", mc_i)
#                     min_mc[i] = mc_i      
                    

            
            all_rnd_perm.append(rnd_perm)
            count += 1
            
    for ind in range(0,total_users):
        #print(phi_vector[ind])
        phi_vector[ind] = phi_vector[ind]/(m)
        #print(phi_vector[ind])
        #print("rnd I: ", ind," phi: ", phi_vector[ind])
    #print(phi_vector)
    #print(phi_vector[0])
    #print(t,phi_vector)
    #elapsed_2 = timeit.default_timer() - start_time_2
    #print(elapsed_2)
    return phi_vector


def computePsi(aggregate_consum,psi_a):
    
    psi_shape = numpy.zeros(24)
    
    psi_b = computeB(aggregate_consum,psi_a)
    
    for t in range(0,24):
        if aggregate_consum[t] <= objective_norm[t]:
            psi_shape[t] = aggregate_consum[t] * numpy.exp(psi_a*(aggregate_consum[t]-objective_norm[t]))
        else:
            psi_shape[t] = aggregate_consum[t] * numpy.exp(psi_b*(aggregate_consum[t]-objective_norm[t]))
    
    return psi_b, psi_shape

def computeB(aggregate_consum,psi_a):
    sum_under = 0
    
    # Computing under with parameter a
    for t in range(0,24):
        if aggregate_consum[t] <= objective_norm[t]:
            sum_under = sum_under + (aggregate_consum[t] * numpy.exp(psi_a*(aggregate_consum[t]-objective_norm[t])))
        
    print(psi_a, sum_under)
    
    #Amount of penalties to reach
    sum_penalties = total_fix_income - sum_under
    
    #print(sum_penalties)
    
    step = 0.0000001
    psi_b = psi_a/10
    sum_over = 0
    epsilon = 1
    
    # Looking for the "best" value 'b'
    while(sum_penalties - epsilon > sum_over):
        psi_b = psi_b + step
        sum_over = 0
        #print("B: ", psi_b)
        for t in range(0,24):
            if aggregate_consum[t] > objective_norm[t]:
                sum_over = sum_over + (aggregate_consum[t] * numpy.exp(psi_b*(aggregate_consum[t]-objective_norm[t])))
        #print("SUM OVER: ", sum_over)
    
    sum_final_income = sum_over + sum_under
    print("FIX: ", total_fix_income," - A: ", psi_a," - B: ", psi_b," - SUM Under: ", sum_under," - SUM Over: ", sum_over," - SUM FINAL: ", sum_final_income)
    return psi_b

if __name__ == '__main__':    
#     extractor = parallelTestModule.ParallelExtractor()
#     extractor.runInParallel(numProcesses=2, numThreads=4)

    # ------ START -------
    start_time_1 = timeit.default_timer()
    
    logging.basicConfig(filename='log_thread.txt',level=logging.DEBUG,format="%(asctime)s:%(levelname)s:%(message)s")
      
    # number of agents
    n_house, n_comm = 100, 0
    
    # READER del FILE
    ftes_count = open('input_consumption.csv', 'r')
    reader_count = csv.reader(ftes_count)
    ftes = open('input_consumption.csv', 'r')
    reader = csv.reader(ftes)

    total_users = sum(1 for row_count in reader_count)
    print(total_users)

    msg = "Starting...Num Users: " + str(total_users)
    logging.info(msg) 
    
    data = numpy.zeros((total_users, 28))
    consumptions = numpy.zeros((total_users, 24))
    name_build = []
    class_index = numpy.zeros(total_users)
    rich_poor = numpy.zeros(total_users)
    shifting_capacity = numpy.zeros(total_users)    

    index = 0
    for row in reader:
        temp = []
        index_name = 0
        for a in row:
            if index_name != 1:
                temp.append(float(a))
            else:
                name_build.append(a)
            index_name += 1
        #print(temp)
        data[index] = temp
        #consumptions.append(temp)
        index = index + 1
    # print(data)   
    data_2 = deepcopy(data)
    data_3 = deepcopy(data)
    #print(data_3[:,0])
    consumptions = numpy.delete(data, [0,1,26,27], 1)
    #print(data)
    #print(data[10,:])
    class_index = data_2[:,1]
    rich_poor = data_2[:,26]
    shifting_capacity = data_2[:,27]
    
    #print(aggregate_consum)
    
    # Objective function to normalize according Consumption
    # TODO: ESTRARLA DA UN FILE CSV
    objective = [12.32708688, 11.3253833, 10.19420784, 9.27427598, 8.831345826, 8.214650767, 9.591141397, 18.77683135, 27.6286201, 32.9471891, 35.2879046, 38.06473595, 39.00170358, 39.6592845, 39.11073254, 37.35945486, 36.78705281, 35.01873935, 27.49574106, 18.28620102, 16.11243612, 16.79045997, 16.35434412, 14.34752981]
    
    total_fix_income = 0
    total_objective = 0
    
    # Computer Aggregated Consumption
    aggregate_consum = numpy.zeros(24)
        
    for t in range(0,24):
        for user in range(0,total_users):
            aggregate_consum[t] =  aggregate_consum[t] + consumptions[user,t]
            
    print(aggregate_consum)
    
    for t in range(0,24):
        total_fix_income = total_fix_income + aggregate_consum[t]
        total_objective = total_objective + objective[t]
        
    #print(total_fix_income)
    #print(total_objective)
    
    ratio_consum_prod = total_fix_income / total_objective
    
    # Normalized objective
    objective_norm = [x * ratio_consum_prod for x in objective]
    
    
    list_ag = []
    for index in range(0,total_users):
        list_ag.append(str(index))
    total_run = 1
    
    sum_peaks = 0
    t_peaks = 0
     
    for t in range(0,24):
        if aggregate_consum[t] > objective_norm[t]:
            sum_peaks += aggregate_consum[t]-objective_norm[t]
            t_peaks += 1
     
    av_peaks = sum_peaks/t_peaks
         
    t_plot = range(0,24)
    
    # TODO: DIMUNIRE 'M'
    m = 100
    
    n_th = 4
           
    #psi_a_1 = 0.000005
    # TODO: VERIFICARE 'A' INIZIALE
    psi_a_1 = 0.0008
    psi_b_1, psi_shape_1 = computePsi(aggregate_consum,psi_a_1)
    
#     new_sum_peaks = 9999999998
#     previuous_sum_peaks = 9999999999
    
    phi_rnd = numpy.zeros((total_users, 24))
    
#     LIST FOR MIN-MAX MARGINAL CONTR.
    max_mc = numpy.zeros(total_users)
    min_mc = [100]*total_users
    upper_m = numpy.zeros(total_users)
    n_samples = numpy.zeros((total_users, 24))
    
    for t in range(0,24):
        #phi_out = computeRandomCastroSV(new_consumptions,m,psi_a_1,psi_b_1)
        #print("Cycle: ", cycle, "t: ", t)
        #phi_out = computeRandomCastroSV_Threaded(n_th,consumptions,2000,psi_a_1,psi_b_1)
#         for ag in range(0,total_users):
#             phi_rnd[ag,t] = phi_out[ag]
     
    #numpy.savetxt('phi_values.csv', phi_rnd, delimiter=',')
        
        for user in range(0,total_users):
            alpha_param = 0.1
            # error percentage
#             err = numpy.mean(phi_out) / 50
#             print(err)
            err = 0.02
            
            if aggregate_consum[t] <= objective_norm[t]:
                psi_I = aggregate_consum[t] * numpy.exp(psi_a_1*(aggregate_consum[t]-objective_norm[t]))
            else:
                psi_I = aggregate_consum[t] * numpy.exp(psi_b_1*(aggregate_consum[t]-objective_norm[t]))
            
            cons_no_I = aggregate_consum[t] - consumptions[user,t]
            if cons_no_I <= objective_norm[t]:
                psi_no_I = cons_no_I * numpy.exp(psi_a_1*(cons_no_I-objective_norm[t]))
            else:
                psi_no_I = cons_no_I * numpy.exp(psi_b_1*(cons_no_I-objective_norm[t]))
            
            max_mc = psi_I - psi_no_I
            
            if consumptions[user,t] <= objective_norm[t]:
                min_mc = consumptions[user,t] * numpy.exp(psi_a_1*(consumptions[user,t]-objective_norm[t]))
            else:
                min_mc = consumptions[user,t] * numpy.exp(psi_b_1*(consumptions[user,t]-objective_norm[t]))
            
#             print(user,max_mc)
#             print(user,min_mc)
#             print(user,max_mc-min_mc)
            
            #z_{a/2} = \Phi^-1(1 - a/2) 
            z_alpha_over_2 = math.sqrt(-(math.pi/2)*math.log(1-math.pow((2*(1-alpha_param/2)-1),2)))
            z_alpha_over_2_pow = math.pow(z_alpha_over_2,2)
            
            sigma_pow_2 = math.pow((max_mc-min_mc),2)/4
            n_samples[user,t] = z_alpha_over_2_pow*sigma_pow_2/math.pow(err,2)
            
#             for i in range(0,total_users):
#                 sigma_pow_2 = math.pow((max_mc[i]-min_mc[i]),2)/4
#                 #print(math.pow(sigma,2))
#                 upper_m[i] = z_alpha_over_2_pow*sigma_pow_2/math.pow(err,2)
             
            #print("Err: ", err, " - z_alpha_over_2: ", z_alpha_over_2, " - sigma^2: ", sigma_pow_2, "num Samples: ", n_samples[user,t])
        
        print(t, numpy.mean(n_samples[:,t]))
        print(t, numpy.max(n_samples[:,t]))
#             print("MEAN: ", numpy.mean(upper_m))
#             print("MAX: ",numpy.amax(upper_m))   
        
#         elapsed_1 = timeit.default_timer() - start_time_1
#         msg = "Time Elapsed 1: " + str(elapsed_1) + " - num. Agents: " + str(total_users) + " - Samples: " + str(m) + " - Num. Thread: " + str(n_th)
#         logging.info(msg)
#         print("Time: ",elapsed_1)
#          
#         print("MEAN phi: ", numpy.mean(phi_out))
#         print("MAX phi: ",numpy.amax(phi_out)) 
    
    
    
    
    
    
    
#     new_av_peaks = 9999
#     
#     array_sum_peaks = []
#     array_av_peaks = []
#     array_a = []
#     array_tot_shift =[]
#     
#     psi_a_start = 0.00005
#     psi_a_step = 0.000005
#     
# #     first_sum_peaks = 0
# #     first_t_peaks = 0
# #     
# #     for t in range(0,24):
# #         if aggregate_consum[t] > objective_norm[t]:
# #             first_sum_peaks += aggregate_consum[t]-objective_norm[t]
# #             first_t_peaks += 1
# #       
# #         first_av_peaks = first_sum_peaks/first_t_peaks
# #         
# #         array_sum_peaks.append(first_sum_peaks)
# #         array_av_peaks.append(first_av_peaks)
#         
#     
#     previuous_sum_peaks = sum_peaks
#     new_sum_peaks = previuous_sum_peaks - 1
#     
#     pre_shifted_ener = 0
#     new_shifted_ener = 1
#     
#     n_cycles = 100
#     
#     #while(previuous_sum_peaks > new_sum_peaks):      
#     #while(pre_shifted_ener < new_shifted_ener):
#     for cycle in range(1,n_cycles+1):
    #psi_a_1 = psi_a_1 + psi_a_step
    #array_a.append(psi_a_1)
    #psi_a_1 = 0.0008
    psi_b_1, psi_shape_1 = computePsi(aggregate_consum,psi_a_1)
    print("psi A: ", psi_a_1, " - B: ", psi_b_1)
     
#     if cycle == 1:
#         psi_initial = deepcopy(psi_shape_1)
#         psi_b_ini = psi_b_1
    
    psi_initial = deepcopy(psi_shape_1)
    psi_b_ini = psi_b_1
    
    phi_rnd = numpy.zeros((total_users, 24))
     
    n_th = 4
     
    for t in range(0,24):
        #phi_out = computeRandomCastroSV(new_consumptions,m,psi_a_1,psi_b_1)
        #print("Cycle: ", cycle, "t: ", t)
        m_randomSV = numpy.max(n_samples[:,t])
    
        print("time: ",t, " - samples: ", m_randomSV)
        
        phi_out = computeRandomCastroSV_Threaded(n_th,consumptions,m_randomSV,psi_a_1,psi_b_1)
        print(phi_out)
        for ag in range(0,total_users):
            phi_rnd[ag,t] = phi_out[ag]
        
    
    #print(phi_rnd)

    print(data_3[:,0])
    num_id = data_3[:,0]
    num_id = num_id.reshape((-1,1))
    print(num_id)
    #output = [numpy.transpose(data_3[:,0]), phi_rnd]
    output = numpy.concatenate((num_id, phi_rnd), axis=1)
    #print(output)
    # TODO: SALVARE SU CSV I 'PHI' 
    numpy.savetxt('output_script.csv', output, delimiter=',')  
    
    
    
    
    
    
    
    # +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    # +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++    
    # +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++    
    
    
    
    
    
    
    
    
    
    
#     # USERS' REACTION
#     valuation_fun = numpy.zeros(total_users)
#     total_payment = numpy.zeros(total_users)
#     utility = numpy.zeros(total_users)
#        
#     #new_consumtpions = consumptions
#       
#       
#     shift_ag = []
#     shift_ag_cons = []
#     new_consumptions = numpy.zeros((total_users, 24))
#     new_consumptions = deepcopy(consumptions)
#      
# #         fig5 = plt.figure()
# #         #plt.ion()
# #         plt.title("Num. Agents: " + str(total_users) + " - Random size: " + str(m))
# #         plt.xlabel('time')
# #         plt.ylabel('Energy')
# #         plt.plot(t_plot,new_consumptions[2,:], c='b', label="Initial Consumption")
# #         plt.plot(t_plot,consumptions[2,:]+0.1,c='r', label="Objective Function")
# #         plt.show()
#       
#     for ag in range(0,total_users):            
#         for t in range(0,24):
#             valuation_fun[ag] += consumptions[ag,t]
#             total_payment[ag] += phi_rnd[ag,t]
#         #utility[ag] = rich_poor[ag]*valuation_fun[ag] - total_payment[ag]
#         utility[ag] = valuation_fun[ag] - total_payment[ag]   
#         if utility[ag] < 0:
#             #print(ag, "has utility less than 0")
#             prices = (phi_rnd[ag]/consumptions[ag]).tolist()
#             best_prices = sorted(prices)[0:5]
#             worst_prices = sorted(prices, reverse=True)[0:5]
# #                 print("BEST: ", best_prices)
# #                 print("WORST: ", worst_prices)
#              
#             total_shift = 0
#              
#             for sh in range(0,5):
#                 t_best = prices.index(best_prices[sh])
#                 t_worst = prices.index(worst_prices[sh])
#                  
#                 energy_shifted = consumptions[ag,t_worst]*shifting_capacity[ag]
#                 total_shift += energy_shifted
#                 new_consumptions[ag,t_best] = consumptions[ag,t_best] + energy_shifted
#                 new_consumptions[ag,t_worst] = consumptions[ag,t_worst] - energy_shifted
#              
#             shift_ag.append(ag)
#             shift_ag_cons.append(total_shift)
#      
#     aggreg_shifted = 0
#      
#     for user in range(0,len(shift_ag_cons)):
#         aggreg_shifted += shift_ag_cons[user]
#      
# #     pre_shifted_ener = new_shifted_ener
# #     new_shifted_ener = aggreg_shifted
#      
# #     print("in WHILE (pre - new): ", pre_shifted_ener, new_shifted_ener)
#      
#     # New Computer Aggregated Consumption
#     new_aggregate_consum = numpy.zeros(24)
#        
#     for t in range(0,24):
#         for user in range(0,total_users):
#             new_aggregate_consum[t] += new_consumptions[user,t]
#       
#     # Final Psi
#     psi_b_1_new, psi_final = computePsi(new_aggregate_consum,psi_a_1)
#     print("psi_final = ", psi_final)
#      
# #     previuous_sum_peaks = new_sum_peaks
# #     previuous_av_peaks = new_av_peaks
# #      
# #     new_sum_peaks = 0
# #     new_t_peaks = 0
# #        
# #     for t in range(0,24):
# #         if new_aggregate_consum[t] > objective_norm[t]:
# #             new_sum_peaks += new_aggregate_consum[t]-objective_norm[t]
# #             new_t_peaks += 1
# #        
# #     new_av_peaks = new_sum_peaks/new_t_peaks
# #      
# #     array_sum_peaks.append(new_sum_peaks)
# #     array_av_peaks.append(new_av_peaks)
# #     array_tot_shift.append(aggreg_shifted)
#      
#      
#      
#     msg = "Shifted energy: " + str(new_aggregate_consum-aggregate_consum)
#     logging.info(msg) 
#     print(new_aggregate_consum-aggregate_consum)
#      
#     msg = " Agents that shifted: " + str(shift_ag) + " - " + str(len(shift_ag))
#     logging.info(msg)
#     msg = " Amount shifted per agent: " + str(shift_ag_cons)
#     logging.info(msg) 
#        
# #     msg = "A: " + str(psi_a_1) + " - Sum Peaks: " + str(previuous_sum_peaks) + " - " + str(new_sum_peaks) + " ____ Average Peaks: " + str(av_peaks) + " - " + str(new_av_peaks)
# #     logging.info(msg) 
#        
#     elapsed_1 = timeit.default_timer() - start_time_1
#     msg = "Time Elapsed 1: " + str(elapsed_1) + "- num. Agents: " + str(total_users)
#     logging.info(msg) 
#     #print("Time Elapsed 1: ", elapsed_1, "- num. Agents: ", total_users)
#        
#     fig = plt.figure()
#     #plt.ion()
#     plt.title("Num. Agents: " + str(total_users))
#     plt.xlabel('Time')
#     plt.ylabel('Energy - Money')
#     plt.plot(t_plot,aggregate_consum, c='b', label="Initial Consumption")
#     plt.plot(t_plot,objective_norm,c='r', label="Objective Function")
#     plt.plot(t_plot,psi_initial,'go-', label="Psi (a=" + str(round(psi_a_1,7))+",b="+ str(round(psi_b_1,8)) +")")
#     plt.plot(t_plot,psi_final,'g^-', label="Final Psi (a=" + str(round(psi_a_1,7))+",b="+ str(round(psi_b_1_new,8)) +")")
#     plt.plot(t_plot,new_aggregate_consum,c='dodgerblue',label="Final Consumption")
#     plt.legend(loc='upper left')
#     plt.savefig('img/out_a-'+str(round(psi_a_1,7))+'.png', dpi = 150)
#     #plt.show()
#     
#     fig2 = plt.figure()
#     #plt.ion()
#     plt.title("Num. Agents: " + str(total_users))
#     plt.xlabel('Time')
#     plt.ylabel('Energy')
#     plt.plot(t_plot,aggregate_consum, c='b', label="Initial Consumption")
#     plt.plot(t_plot,objective_norm,c='r', label="Objective Function")
#     plt.plot(t_plot,new_aggregate_consum,c='dodgerblue',label="Final Consumption")
#     plt.legend(loc='upper left')
#     plt.savefig('img/out_a-'+str(round(psi_a_1,7))+'.png', dpi = 150)
#     
#     fig3 = plt.figure()
#     #plt.ion()
#     plt.title("Num. Agents: " + str(total_users))
#     plt.xlabel('Time')
#     plt.ylabel('Money')
#     plt.plot(t_plot,psi_initial,'go-', label="Psi (a=" + str(round(psi_a_1,7))+",b="+ str(round(psi_b_1,8)) +")")
#     plt.plot(t_plot,psi_final,'g^-', label="Final Psi (a=" + str(round(psi_a_1,7))+",b="+ str(round(psi_b_1_new,8)) +")")
#     plt.legend(loc='upper left')
#     plt.savefig('img/out_a-'+str(round(psi_a_1,7))+'.png', dpi = 150)
#     
# #         
# #         
# #     msg = "A: " + str(array_a) + "- Sum Peaks: " + str(array_sum_peaks) + "- Av. Peaks: " + str(array_av_peaks) + " - Shifted: " + str(array_tot_shift) 
# #     logging.info(msg) 
# #     
# #     fig2 = plt.figure()
# #     plt.title("Num. Agents: " + str(total_users) + " - 'a' parameter")
# #     plt.xlabel('a')
# #     plt.ylabel('Energy')
# #     plt.plot(array_a,array_sum_peaks,c='r', label="Sum Peak over Objective")
# #     plt.legend(loc='upper left')
# #     plt.savefig('img/out_sum.png', dpi = 150)
# #     #plt.show()
# #     
# #     fig3 = plt.figure()
# #     plt.title("Num. Agents: " + str(total_users) + " - 'a' parameter")
# #     plt.xlabel('a')
# #     plt.ylabel('Energy')
# #     plt.plot(array_a,array_av_peaks,c='g', label="Average Peak over Objective")
# #     plt.legend(loc='upper left')
# #     plt.savefig('img/out_av.png', dpi = 150)
# #     
# #     fig4 = plt.figure()
# #     plt.title("Num. Agents: " + str(total_users) + " - 'a' parameter")
# #     plt.xlabel('a')
# #     plt.ylabel('Energy')
# #     plt.plot(array_a,array_tot_shift,c='b', label="Energy Shifted")
# #     plt.legend(loc='upper left')
# #     plt.savefig('img/out_sh.png', dpi = 150)
# #     
# #     # plt.plot(t,aggregate_consum, 'b',t,objective_norm,'r',t,psi_shape_1,'m-',t,psi_shape_2,'g-o')
# #     # plt.ylabel('Energy')
# #     # plt.show()
#     
    
    
    
    
    
    
    
    
    
    
    
    
    
    
