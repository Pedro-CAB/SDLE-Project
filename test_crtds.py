import pytest
from crdt.two_phase_set import TwoPhaseSet
from crdt.lww_register import LWWRegister

def test_two_phase_set_addition():
    tp_set = TwoPhaseSet()
    tp_set.add("apple")
    assert tp_set.exists("apple")

def test_two_phase_set_removal():
    tp_set = TwoPhaseSet()
    tp_set.add("banana")
    tp_set.remove("banana")
    assert not tp_set.exists("banana")

def test_lww_register_update():
    lww_reg = LWWRegister()
    lww_reg.update("old_value", 1)
    lww_reg.update("new_value", 2)
    assert lww_reg.get_value() == "new_value"

def test_lww_register_merge():
    reg1 = LWWRegister()
    reg2 = LWWRegister()
    reg1.update("value1", 1)
    reg2.update("value2", 3)
    reg1.merge(reg2)
    assert reg1.get_value() == "value2"
